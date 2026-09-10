import React from 'react';
import { HeartHandshake, PhoneCall, ExternalLink } from 'lucide-react';

export const DistressBanner: React.FC = () => {
  return (
    <div
      id="distress-safety-banner"
      className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 my-3 text-rose-200 text-sm leading-relaxed"
    >
      <div className="flex items-center gap-2 font-semibold text-rose-300 mb-1.5">
        <HeartHandshake className="w-5 h-5 text-rose-400 flex-shrink-0" />
        <span>Compassionate Support is Available (24/7 & Free)</span>
      </div>
      <p className="mb-2.5 text-zinc-300 text-xs sm:text-sm">
        MoodLog is a personal reflection diary and cannot provide medical or emergency support. If you are going through a painful crisis or having thoughts of self-harm, please reach out to dedicated advocates ready to listen:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
        <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-800/40 p-2 rounded-lg">
          <PhoneCall className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>Call or text <strong>988</strong> (US & Canada Lifeline)</span>
        </div>
        <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-800/40 p-2 rounded-lg">
          <PhoneCall className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>Text <strong>HOME</strong> to <strong>741741</strong> (Crisis Text Line)</span>
        </div>
      </div>
      <div className="mt-2 text-right">
        <a
          href="https://findahelpline.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-100 underline underline-offset-2"
        >
          International helplines directory <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
