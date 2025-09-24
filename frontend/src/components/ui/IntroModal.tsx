'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Wallet, Zap, Trophy, History, Shield, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface IntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * IntroModal provides a comprehensive 4-slide introduction to Meme Battle Royale.
 * Guides new users through wallet connection, gameplay, and features.
 * 
 * Features:
 * - Welcome slide with game overview
 * - Wallet setup guide with Sepolia faucet link
 * - Gameplay tutorial with battle flow
 * - Features overview with privacy highlights
 */
export function IntroModal({ isOpen, onClose }: IntroModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Reset slide when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        handlePrevious();
      } else if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSlide]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(current => current + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(current => current - 1);
    }
  };

  const slides = [
    {
      // Slide 1: Welcome & Game Overview
      title: "Welcome to Meme Battle Royale",
      subtitle: "Privacy-First Meme Competition",
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#FCD216] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-[#1E1D1B]" />
            </div>
            <p className="text-sm text-[#1E1D1B] leading-relaxed">
              Join the ultimate privacy-preserving meme battle where your votes stay encrypted until results are revealed!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1E1D1B]/3 rounded-2xl p-3 text-center">
              <div className="w-8 h-8 bg-[#DCAC5A] rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="h-4 w-4 text-[#1E1D1B]" />
              </div>
              <h3 className="font-semibold text-[#1E1D1B] mb-1 text-xs">Private Voting</h3>
              <p className="text-xs text-[#1E1D1B]/60">FHEVM encrypted</p>
            </div>
            
            <div className="bg-[#1E1D1B]/3 rounded-2xl p-3 text-center">
              <div className="w-8 h-8 bg-[#E8A02E] rounded-lg flex items-center justify-center mx-auto mb-2">
                <Trophy className="h-4 w-4 text-[#1E1D1B]" />
              </div>
              <h3 className="font-semibold text-[#1E1D1B] mb-1 text-xs">Battle Royale</h3>
              <p className="text-xs text-[#1E1D1B]/60">5 meme templates</p>
            </div>
          </div>

          <div className="bg-[#FCD216]/15 rounded-2xl p-3 text-center">
            <p className="text-xs text-[#1E1D1B]/80 font-medium">
              Built by <span className="font-semibold text-[#1E1D1B]">0xSyncroot</span> • Powered by Zama's FHEVM
            </p>
          </div>
        </div>
      )
    },
    {
      // Slide 2: Wallet Setup & Sepolia
      title: "Setup Your Wallet",
      subtitle: "Connect to Sepolia Testnet",
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#DCAC5A] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Wallet className="h-6 w-6 text-[#1E1D1B]" />
            </div>
            <p className="text-sm text-[#1E1D1B] leading-relaxed">
              Connect your wallet to Sepolia testnet with some ETH for gas fees.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-[#1E1D1B]/3 rounded-2xl p-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#FCD216] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#1E1D1B] font-bold text-xs">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E1D1B] mb-1 text-xs">Connect Wallet</h3>
                  <p className="text-xs text-[#1E1D1B]/60">Click "Connect Wallet" to link your Ethereum wallet</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1E1D1B]/3 rounded-2xl p-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#E8A02E] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#1E1D1B] font-bold text-xs">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E1D1B] mb-1 text-xs">Switch to Sepolia</h3>
                  <p className="text-xs text-[#1E1D1B]/60">Ensure wallet is connected to Sepolia testnet</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1E1D1B]/3 rounded-2xl p-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#FFC34B] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="text-[#1E1D1B] h-3 w-3" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1E1D1B] mb-1 text-xs">Get Test ETH</h3>
                  <p className="text-xs text-[#1E1D1B]/60 mb-2">Need Sepolia ETH? Get it free:</p>
                  <a
                    href="https://sepoliafaucet.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-[#FCD216] hover:bg-[#B38B1B] text-[#1E1D1B] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Sepolia Faucet
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      // Slide 3: Gameplay Tutorial
      title: "How to Play",
      subtitle: "Battle Flow & Voting",
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#E8A02E] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Trophy className="h-6 w-6 text-[#1E1D1B]" />
            </div>
            <p className="text-sm text-[#1E1D1B] leading-relaxed">
              Submit your encrypted vote and watch the battle unfold in real-time!
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-[#1E1D1B]/3 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-[#FCD216] text-[#1E1D1B] text-xs font-semibold px-2 py-1 rounded-lg">Submit</div>
                <h3 className="font-semibold text-[#1E1D1B] text-xs">Choose & Vote</h3>
              </div>
              <p className="text-xs text-[#1E1D1B]/60">
                Select meme template and caption. Choices encrypted before submission.
              </p>
            </div>

            <div className="bg-[#1E1D1B]/3 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-[#DCAC5A] text-[#1E1D1B] text-xs font-semibold px-2 py-1 rounded-lg">Live</div>
                <h3 className="font-semibold text-[#1E1D1B] text-xs">Watch the Battle</h3>
              </div>
              <p className="text-xs text-[#1E1D1B]/60">
                Monitor progress in real-time. Vote counts remain encrypted during battle.
              </p>
            </div>

            <div className="bg-[#1E1D1B]/3 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-[#E8A02E] text-[#1E1D1B] text-xs font-semibold px-2 py-1 rounded-lg">Results</div>
                <h3 className="font-semibold text-[#1E1D1B] text-xs">Oracle Decryption</h3>
              </div>
              <p className="text-xs text-[#1E1D1B]/60">
                After battle ends, oracle network decrypts votes to reveal winner.
              </p>
            </div>
          </div>

          <div className="bg-[#FCD216]/15 rounded-2xl p-3">
            <p className="text-xs text-[#1E1D1B] text-center font-medium">
              <Shield className="h-3 w-3 inline mr-1" />
              <span className="font-semibold">Privacy First:</span> Individual votes never revealed!
            </p>
          </div>
        </div>
      )
    },
    {
      // Slide 4: Features Overview
      title: "Explore Features",
      subtitle: "Everything You Can Do",
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#FFC34B] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <History className="h-6 w-6 text-[#1E1D1B]" />
            </div>
            <p className="text-sm text-[#1E1D1B] leading-relaxed">
              Discover all the features that make Meme Battle Royale unique!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1E1D1B]/3 rounded-2xl p-3 text-center">
              <div className="w-8 h-8 bg-[#FCD216] rounded-lg flex items-center justify-center mx-auto mb-2">
                <History className="h-4 w-4 text-[#1E1D1B]" />
              </div>
              <h3 className="font-semibold text-[#1E1D1B] mb-1 text-xs">Battle History</h3>
              <p className="text-xs text-[#1E1D1B]/60">Browse past battles</p>
            </div>

            <div className="bg-[#1E1D1B]/3 rounded-2xl p-3 text-center">
              <div className="w-8 h-8 bg-[#DCAC5A] rounded-lg flex items-center justify-center mx-auto mb-2">
                <Trophy className="h-4 w-4 text-[#1E1D1B]" />
              </div>
              <h3 className="font-semibold text-[#1E1D1B] mb-1 text-xs">Live Rankings</h3>
              <p className="text-xs text-[#1E1D1B]/60">Privacy-protected</p>
            </div>

            <div className="bg-[#1E1D1B]/3 rounded-2xl p-3 text-center">
              <div className="w-8 h-8 bg-[#E8A02E] rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="h-4 w-4 text-[#1E1D1B]" />
              </div>
              <h3 className="font-semibold text-[#1E1D1B] mb-1 text-xs">FHEVM Encryption</h3>
              <p className="text-xs text-[#1E1D1B]/60">Military-grade</p>
            </div>

            <div className="bg-[#1E1D1B]/3 rounded-2xl p-3 text-center">
              <div className="w-8 h-8 bg-[#FFC34B] rounded-lg flex items-center justify-center mx-auto mb-2">
                <Sparkles className="h-4 w-4 text-[#1E1D1B]" />
              </div>
              <h3 className="font-semibold text-[#1E1D1B] mb-1 text-xs">Caption Reveals</h3>
              <p className="text-xs text-[#1E1D1B]/60">Privacy controls</p>
            </div>
          </div>

          <div className="bg-[#B38B1B] p-4 rounded-2xl text-center">
            <h3 className="font-bold text-[#FCFBF5] text-sm mb-2">Ready to Battle?</h3>
            <p className="text-xs text-[#FCFBF5]/90 font-medium">
              Connect your wallet and join the most private meme battle on the blockchain!
            </p>
          </div>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  const currentSlideData = slides[currentSlide];
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#1E1D1B]/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#FCFBF5] rounded-2xl w-full max-w-xl mx-auto">
        {/* Header with close button */}
        <div className="relative p-4 pb-2">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center hover:bg-[#1E1D1B]/5 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="h-3 w-3 text-[#1E1D1B]/60" />
          </button>
          
          <div className="pr-10 text-center">
            <h1 className="text-lg font-bold text-[#1E1D1B] mb-1">{currentSlideData.title}</h1>
            <p className="text-[#1E1D1B]/70 text-xs font-medium">{currentSlideData.subtitle}</p>
          </div>
        </div>

        {/* Progress Indicator - subtle dots */}
        <div className="flex justify-center gap-2 px-4 pb-3">
          {slides.map((_, index) => (
            <div 
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index <= currentSlide ? 'bg-[#FCD216] scale-125' : 'bg-[#1E1D1B]/20'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-4 pb-2">
          {currentSlideData.content}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 pt-3 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xs text-[#1E1D1B]/50 font-medium">
              {currentSlide + 1} / {slides.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isFirstSlide && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-1 px-3 py-2 text-[#1E1D1B]/70 hover:text-[#1E1D1B] hover:bg-[#1E1D1B]/5 rounded-lg transition-all text-xs font-semibold"
              >
                <ChevronLeft className="h-3 w-3" />
                Previous
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="flex items-center gap-1 bg-[#FCD216] hover:bg-[#B38B1B] text-[#1E1D1B] px-4 py-2 rounded-lg transition-all text-xs font-semibold"
            >
              {isLastSlide ? (
                <>
                  Get Started
                  <Sparkles className="h-3 w-3" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-3 w-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IntroModal;
