import { Room, TitleCard, SwipeDecision, GameStatAward } from '../types';

export class GameSession {
  static startGame(room: Room, titlePool: TitleCard[]): void {
    room.status = 'swiping';
    room.titlePool = this.shuffle([...titlePool]);
    room.swipes.clear();
    room.rankings.clear();
    room.matchedTitles = [];
    room.winner = null;
    for (const player of room.players) {
      player.progress = 0;
      player.finished = false;
      player.superLikeUsed = false;
    }
  }

  static recordSwipe(room: Room, playerId: string, tmdbId: number, decision: 'like' | 'pass' | 'superlike'): void {
    if (!room.swipes.has(playerId)) {
      room.swipes.set(playerId, []);
    }
    room.swipes.get(playerId)!.push({
      tmdbId,
      decision,
      timestamp: Date.now(),
    });

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.progress++;
      if (player.progress >= room.titlePool.length) {
        player.finished = true;
      }
      if (decision === 'superlike') {
        player.superLikeUsed = true;
      }
    }
  }

  static undoSwipe(room: Room, playerId: string): SwipeDecision | null {
    const swipes = room.swipes.get(playerId);
    if (!swipes || swipes.length === 0) return null;

    const undone = swipes.pop()!;
    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.progress = Math.max(0, player.progress - 1);
      player.finished = false;
      if (undone.decision === 'superlike') {
        player.superLikeUsed = false;
      }
    }
    return undone;
  }

  static checkFirstMatch(room: Room, tmdbId: number): TitleCard | null {
    const connectedPlayers = room.players.filter(p => p.connected);
    if (connectedPlayers.length < 2) return null;

    for (const player of connectedPlayers) {
      const swipes = room.swipes.get(player.id);
      if (!swipes) return null;
      const swipe = swipes.find(s => s.tmdbId === tmdbId);
      if (!swipe || swipe.decision === 'pass') return null;
    }

    return room.titlePool.find(t => t.tmdbId === tmdbId) || null;
  }

  static checkAllFinished(room: Room): boolean {
    const connectedPlayers = room.players.filter(p => p.connected);
    return connectedPlayers.every(p => p.finished);
  }

  static computeMatches(room: Room): TitleCard[] {
    const connectedPlayers = room.players.filter(p => p.connected);
    if (connectedPlayers.length === 0) return [];

    const matches: TitleCard[] = [];

    for (const title of room.titlePool) {
      let allLiked = true;
      let anySuperLiked = false;

      for (const player of connectedPlayers) {
        const swipes = room.swipes.get(player.id) || [];
        const swipe = swipes.find(s => s.tmdbId === title.tmdbId);
        if (!swipe || swipe.decision === 'pass') {
          allLiked = false;
        }
        if (swipe?.decision === 'superlike') {
          anySuperLiked = true;
        }
      }

      if (allLiked || anySuperLiked) {
        matches.push(title);
      }
    }

    return matches;
  }

  static computeWildcardCandidates(room: Room): TitleCard[] {
    const connectedPlayers = room.players.filter(p => p.connected);
    const titleLikes: Map<number, number> = new Map();

    for (const title of room.titlePool) {
      let likes = 0;
      for (const player of connectedPlayers) {
        const swipes = room.swipes.get(player.id) || [];
        const swipe = swipes.find(s => s.tmdbId === title.tmdbId);
        if (swipe && swipe.decision !== 'pass') {
          likes++;
        }
      }
      titleLikes.set(title.tmdbId, likes);
    }

    return [...room.titlePool]
      .filter(t => (titleLikes.get(t.tmdbId) || 0) > 0)
      .sort((a, b) => (titleLikes.get(b.tmdbId) || 0) - (titleLikes.get(a.tmdbId) || 0))
      .slice(0, 5);
  }

  static recordRanking(room: Room, playerId: string, rankings: Array<{ tmdbId: number; rank: number }>): void {
    room.rankings.set(playerId, rankings);
  }

  static checkAllRankingsSubmitted(room: Room): boolean {
    const connectedPlayers = room.players.filter(p => p.connected);
    return connectedPlayers.every(p => room.rankings.has(p.id));
  }

  static computeWinner(room: Room): { winner: TitleCard; fullRankings: Array<{ title: TitleCard; avgRank: number }> } {
    const rankingMap: Map<number, number[]> = new Map();

    for (const [, playerRankings] of room.rankings) {
      for (const { tmdbId, rank } of playerRankings) {
        if (!rankingMap.has(tmdbId)) {
          rankingMap.set(tmdbId, []);
        }
        rankingMap.get(tmdbId)!.push(rank);
      }
    }

    const fullRankings = room.matchedTitles.map(title => {
      const ranks = rankingMap.get(title.tmdbId) || [];
      const avgRank = ranks.length > 0 ? ranks.reduce((a, b) => a + b, 0) / ranks.length : Infinity;
      return { title, avgRank };
    }).sort((a, b) => a.avgRank - b.avgRank);

    const winner = fullRankings[0]?.title || room.matchedTitles[0];
    room.winner = winner;

    return { winner, fullRankings };
  }

  static computeStats(room: Room): GameStatAward[] {
    const stats: GameStatAward[] = [];
    const connectedPlayers = room.players.filter(p => p.connected);

    let mostPasses = 0;
    let pickiest = '';
    let mostLikes = 0;
    let movieBuff = '';
    let mostMatches = 0;
    let perfectTaste = '';
    let leastOverlap = Infinity;
    let loneWolf = '';

    const matches = new Set(room.matchedTitles.map(t => t.tmdbId));

    for (const player of connectedPlayers) {
      const swipes = room.swipes.get(player.id) || [];
      const passes = swipes.filter(s => s.decision === 'pass').length;
      const likes = swipes.filter(s => s.decision !== 'pass').length;
      const matchCount = swipes.filter(s => s.decision !== 'pass' && matches.has(s.tmdbId)).length;

      // Count overlap with other players
      let overlap = 0;
      for (const otherPlayer of connectedPlayers) {
        if (otherPlayer.id === player.id) continue;
        const otherSwipes = room.swipes.get(otherPlayer.id) || [];
        for (const swipe of swipes) {
          if (swipe.decision !== 'pass') {
            const otherSwipe = otherSwipes.find(s => s.tmdbId === swipe.tmdbId);
            if (otherSwipe && otherSwipe.decision !== 'pass') {
              overlap++;
            }
          }
        }
      }

      if (passes > mostPasses) { mostPasses = passes; pickiest = player.displayName; }
      if (likes > mostLikes) { mostLikes = likes; movieBuff = player.displayName; }
      if (matchCount > mostMatches) { mostMatches = matchCount; perfectTaste = player.displayName; }
      if (overlap < leastOverlap) { leastOverlap = overlap; loneWolf = player.displayName; }
    }

    if (pickiest) stats.push({ title: 'Most Picky', playerName: pickiest, value: `${mostPasses} passes`, emoji: '🔍' });
    if (movieBuff) stats.push({ title: 'Movie Buff', playerName: movieBuff, value: `${mostLikes} likes`, emoji: '🍿' });
    if (perfectTaste) stats.push({ title: 'Perfect Taste', playerName: perfectTaste, value: `${mostMatches} matches`, emoji: '🤝' });
    if (loneWolf && connectedPlayers.length > 1) stats.push({ title: 'Lone Wolf', playerName: loneWolf, value: `${leastOverlap} overlaps`, emoji: '🐺' });

    // Speed Demon (if timer was enabled)
    if (room.settings.timerSeconds) {
      let fastestAvg = Infinity;
      let speedDemon = '';
      for (const player of connectedPlayers) {
        const swipes = room.swipes.get(player.id) || [];
        if (swipes.length < 2) continue;
        let totalTime = 0;
        for (let i = 1; i < swipes.length; i++) {
          totalTime += swipes[i].timestamp - swipes[i - 1].timestamp;
        }
        const avg = totalTime / (swipes.length - 1);
        if (avg < fastestAvg) { fastestAvg = avg; speedDemon = player.displayName; }
      }
      if (speedDemon) {
        stats.push({ title: 'Speed Demon', playerName: speedDemon, value: `${(fastestAvg / 1000).toFixed(1)}s avg`, emoji: '⚡' });
      }
    }

    return stats;
  }

  static computeSwipeReveal(room: Room): Array<{ title: TitleCard; playerDecisions: Array<{ playerName: string; decision: string }> }> {
    return room.titlePool.map(title => {
      const playerDecisions = room.players
        .filter(p => p.connected)
        .map(player => {
          const swipes = room.swipes.get(player.id) || [];
          const swipe = swipes.find(s => s.tmdbId === title.tmdbId);
          return {
            playerName: player.displayName,
            decision: swipe?.decision || 'pass',
          };
        });
      return { title, playerDecisions };
    });
  }

  private static shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
