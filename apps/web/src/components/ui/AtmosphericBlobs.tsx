'use client';

import { motion } from 'framer-motion';

/**
 * Shared animated background blobs used on lobby/join/create pages.
 * Render once per page inside a `relative overflow-hidden` container.
 * Uses `position: absolute inset-0` so it fills the parent without
 * adding extra layout height or causing overflow.
 */
export default function AtmosphericBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Top accent — red pulse */}
      <motion.div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(229,9,20,0.15) 0%, transparent 65%)' }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Bottom accent — purple pulse */}
      <motion.div
        className="absolute bottom-0 -right-32 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(109,40,217,0.1) 0%, transparent 65%)' }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </div>
  );
}
