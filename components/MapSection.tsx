'use client';

import React from 'react';
import { Ground } from '@/lib/types';

interface MapSectionProps {
  ground: Ground;
}

export const MapSection: React.FC<MapSectionProps> = ({ ground }) => {
  if (!ground.location?.mapLink) {
    return null;
  }

  // Simple approach: Try to show map if it's a Google Maps link, otherwise just show link
  const mapLink = ground.location.mapLink;
  const isGoogleMapsLink = mapLink.includes('maps.google.com') || 
                           mapLink.includes('goo.gl/maps') || 
                           mapLink.includes('maps.app.goo.gl');
  
  // Try to create embed URL for Google Maps (simple approach - just show the link if we can't embed)
  let embedUrl: string | null = null;
  if (mapLink.includes('/embed')) {
    embedUrl = mapLink; // Already an embed URL
  } else if (isGoogleMapsLink) {
    // Try to extract coordinates
    const coordsMatch = mapLink.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (coordsMatch) {
      const lat = coordsMatch[1];
      const lng = coordsMatch[2];
      // Create embed URL with coordinates
      embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAwJzAwLjAiTiA3McKwMDAnMDAuMCJF!5e0!3m2!1sen!2s!4v1234567890!5m2!1sen!2s`;
    }
  }
  
  const canEmbed = embedUrl !== null;
  const address = ground.location.address || ground.location.city || '';

  return (
    <div className="mt-3 sm:mt-4 md:mt-6 p-3 sm:p-4 md:p-5 bg-[var(--card)] rounded-xl border-2 border-[var(--border)] shadow-sm">
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary-600)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="text-sm sm:text-base font-semibold text-[var(--foreground)]">Location</h3>
      </div>
      
      {address && (
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mb-2 sm:mb-3 break-words">
          {address}
          {ground.location.city && `, ${ground.location.city}`}
        </p>
      )}

      {canEmbed ? (
        <div className="relative w-full h-[180px] sm:h-[220px] md:h-[250px] lg:h-[300px] rounded-lg overflow-hidden border border-[var(--border)] mb-2 sm:mb-3">
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0"
          />
        </div>
      ) : (
        <div className="w-full h-[180px] sm:h-[220px] md:h-[250px] lg:h-[300px] rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--muted)] flex items-center justify-center mb-2 sm:mb-3">
          <div className="text-center p-3 sm:p-4">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--muted-foreground)] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mb-2">Map preview not available</p>
            <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)]">Click "Open in Maps" to view location</p>
          </div>
        </div>
      )}
      
      <a
        href={ground.location.mapLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 sm:mt-3 inline-flex items-center justify-center gap-2 text-xs sm:text-sm text-[var(--primary-600)] hover:text-[var(--primary-700)] font-medium min-h-[44px] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-[var(--primary-50)] transition-colors"
      >
        <span>Open in Maps</span>
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
};

