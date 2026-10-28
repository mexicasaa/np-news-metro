import React, { useEffect } from 'react';
import { liveUpdateService } from '../../services/liveUpdateService';

/**
 * Silent Background Synchronizer
 * Monitors for new deployments, article updates, and feature releases in the background
 * and applies updates seamlessly without showing any notification popups or reloading.
 */
export const LiveUpdateNotification: React.FC = () => {
  useEffect(() => {
    // Start silent background monitoring (checks every 25 seconds)
    liveUpdateService.startBackgroundMonitoring(25000);
  }, []);

  // Completely silent - no popup or banner shown in admin or on the website
  return null;
};
