'use client';

import { useState, memo, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MemeTemplateGrid } from './MemeTemplateGrid';
import { useFHEVM } from '@/hooks/useFHEVM';
import { useContract } from '@/hooks/useContract';
import { MEME_TEMPLATES, CONTRACT_ADDRESS } from '@/constants';
import { getCaptionsByCategory, CaptionPreset } from '@/constants/captions';
import { Shield, Send, AlertCircle, Sparkles, Lock, Loader2, ExternalLink } from 'lucide-react';

/** SubmissionForm component props */
interface SubmissionFormProps {
  /** Callback executed after successful vote submission */
  onSuccess?: () => void;
}

/**
 * SubmissionForm handles encrypted vote submission for meme battle participation.
 * 
 * Features:
 * - Template selection from predefined memes
 * - Caption selection from categorized presets
 * - Parallel FHEVM encryption with progress indicators
 * - Privacy-first submission with transaction linking
 * - Comprehensive error handling and user feedback
 * 
 * @component
 * @example
 * <SubmissionForm onSuccess={() => console.log('Vote submitted!')} />
 */

const SubmissionForm = memo<SubmissionFormProps>(({ onSuccess }) => {
  // Form state management
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [selectedCaption, setSelectedCaption] = useState<CaptionPreset | null>(null);
  const [captionCategory, setCaptionCategory] = useState<'meme' | 'emoji' | 'reaction'>('meme');
  
  // Submission progress state
  const [submitting, setSubmitting] = useState(false);
  const [encryptionProgress, setEncryptionProgress] = useState<string>('');
  const [encryptionStep, setEncryptionStep] = useState<number>(0);

  // External dependencies
  const { initialized, error: fhevmError, encryptVote, encryptCaptionText } = useFHEVM();
  const { submitVote, isLoading: contractLoading, error: contractError } = useContract();
  const { ready, authenticated } = usePrivy();

  /**
   * Handles encrypted vote submission with parallel FHEVM encryption.
   * 
   * Process:
   * 1. Validates form inputs and wallet connection
   * 2. Encrypts template and caption selections in parallel
   * 3. Submits encrypted data to smart contract
   * 4. Provides user feedback with transaction link
   * 
   * @throws {Error} When encryption times out (30s) or contract submission fails
   */
  const handleSubmit = useCallback(async () => {
    // Input validation
    if (selectedTemplate === null || !selectedCaption || !CONTRACT_ADDRESS) {
      toast.error('Please complete your selection.');
      return;
    }

    if (!ready || !authenticated) {
      toast.error('Please connect your wallet to submit votes.');
      return;
    }

    const loadingToast = toast.loading('Encrypting and submitting vote...');

    try {
      setSubmitting(true);
      
      // Phase 1: Encryption preparation
      setEncryptionStep(1);
      setEncryptionProgress('Preparing encryption parameters...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Phase 2: Parallel encryption with timeout protection
      setEncryptionStep(2);
      setEncryptionProgress('Encrypting selections simultaneously...');
      
      const encryptionPromises = [
        encryptVote(selectedTemplate, CONTRACT_ADDRESS),
        encryptCaptionText(selectedCaption.id, CONTRACT_ADDRESS)
      ];
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Encryption timeout after 30 seconds')), 30000)
      );
      
      const [encryptedTemplate, encryptedCaption] = await Promise.race([
        Promise.all(encryptionPromises),
        timeoutPromise
      ]) as [any, any];
      
      // Phase 3: Submission preparation
      setEncryptionStep(3);
      setEncryptionProgress('Encryption completed, preparing submission...');
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Phase 4: Blockchain submission
      setEncryptionStep(4);
      setEncryptionProgress('Submitting to blockchain...');
      const tx = await submitVote(
        encryptedTemplate.encryptedData,
        encryptedTemplate.proof,
        encryptedCaption.encryptedData,
        encryptedCaption.proof
      );

      // Success feedback with transaction link
      toast.dismiss(loadingToast);
      
      const txHash = tx?.hash;
      if (txHash) {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-lg">🎉</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Vote Submitted Successfully!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Your encrypted vote is now on the blockchain
                  </p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View on Sepolia Etherscan
                  </a>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                ✕
              </button>
            </div>
          </div>
        ), { duration: 8000 });
      } else {
        toast.success('🎉 Vote submitted successfully!');
      }

      // Reset form state
      setSelectedTemplate(null);
      setSelectedCaption(null);
      setCaptionCategory('meme');
      setEncryptionProgress('');
      setEncryptionStep(0);
      
      onSuccess?.();
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Submission failed: ${errorMessage}`);
    } finally {
      setSubmitting(false);
      setEncryptionProgress('');
      setEncryptionStep(0);
    }
  }, [selectedTemplate, selectedCaption, ready, authenticated, encryptVote, encryptCaptionText, submitVote, onSuccess]);

  // Derived state for UI control
  const canSubmit = selectedTemplate !== null && selectedCaption !== null && !submitting && initialized;
  const isProcessing = submitting || contractLoading;

  // Error state rendering
  if (fhevmError) {
    return (
      <Card className="border border-red-200 bg-gradient-to-r from-red-50 to-red-100">
        <CardContent className="p-4 mt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="font-medium text-red-800 text-sm">FHEVM Encryption Error</h3>
              <p className="text-xs text-red-600 leading-relaxed">{fhevmError}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (contractError) {
    return (
      <Card className="border border-red-200 bg-gradient-to-r from-red-50 to-red-100">
        <CardContent className="p-4 mt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="font-medium text-red-800 text-sm">Contract Connection Error</h3>
              <p className="text-xs text-red-600 leading-relaxed">{contractError}</p>
              <p className="text-xs text-red-500">Check your wallet connection and network settings.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="space-y-4">
      {/* Step 1: Template Selection */}
      <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base font-semibold text-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full text-xs font-bold text-blue-700">
                1
              </div>
              <span>Select Template</span>
            </div>
            {selectedTemplate !== null && (
              <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-1">
                {MEME_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <MemeTemplateGrid
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
            disabled={!initialized}
          />
        </CardContent>
      </Card>

      {/* Step 2: Caption Selection */}
      <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base font-semibold text-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full text-xs font-bold text-purple-700">
                2
              </div>
              <span>Choose Caption</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200 text-xs px-2 py-1">
                <Sparkles className="h-3 w-3" />
                <span>Preset</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1">
                <Lock className="h-3 w-3" />
                <span>Encrypted</span>
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Caption category selector */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
            {(['meme', 'emoji', 'reaction'] as const).map((category) => (
              <Button
                key={category}
                variant={captionCategory === category ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setCaptionCategory(category)}
                disabled={!initialized}
                className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                  captionCategory === category
                    ? 'bg-white shadow-sm text-slate-800'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <span className="mr-1.5">
                  {category === 'meme' && '🎭'}
                  {category === 'emoji' && '😂'}
                  {category === 'reaction' && '💯'}
                </span>
                <span className="capitalize font-medium">{category}</span>
              </Button>
            ))}
          </div>

          {/* Preset caption grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            {getCaptionsByCategory(captionCategory).slice(0, 18).map((caption) => (
              <button
                key={caption.id}
                onClick={() => setSelectedCaption(caption)}
                disabled={!initialized}
                className={`group p-3 rounded-lg border text-left transition-all duration-200 ${
                  selectedCaption?.id === caption.id
                    ? 'border-purple-300 bg-purple-50 shadow-sm ring-1 ring-purple-200'
                    : 'border-slate-200 hover:border-purple-200 hover:bg-purple-25 hover:shadow-sm'
                } ${!initialized ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg flex-shrink-0">{caption.emoji}</span>
                  <span className={`text-xs font-medium leading-tight ${
                    selectedCaption?.id === caption.id ? 'text-purple-700' : 'text-slate-700 group-hover:text-purple-600'
                  }`}>
                    {caption.text}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Current selection preview */}
          {selectedCaption && (
            <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedCaption.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-purple-800 text-sm">{selectedCaption.text}</p>
                  <p className="text-xs text-purple-600 mt-0.5">
                    ID: {selectedCaption.id} • {selectedCaption.category}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Battle Submission */}
      <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base font-semibold text-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full text-xs font-bold text-indigo-700">
                3
              </div>
              <span>Join Battle Royale</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Privacy features and submission summary */}
          <div className="p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-purple-100">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                <p className="text-sm font-semibold text-slate-700">Privacy-First Battle</p>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 ml-4">
                <li className="flex items-start gap-1">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Template choice encrypted with FHEVM</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Caption ID encrypted (not the text itself)</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Contract computes on encrypted data</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Results revealed only after battle ends</span>
                </li>
              </ul>
            </div>
            
            {/* Current selections summary */}
            {selectedTemplate !== null && selectedCaption && (
              <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <p className="text-sm font-semibold text-purple-800 mb-2">Your Battle Entry</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-xs text-purple-600 font-medium">Template</span>
                    <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {MEME_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-purple-600 font-medium">Caption</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedCaption.emoji}</span>
                      <span className="text-xs font-medium text-slate-700">{selectedCaption.text}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress indicator during submission */}
          {isProcessing && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">
                  {encryptionProgress || 'Processing transaction...'}
                </span>
              </div>
            </div>
          )}

          {/* Primary submission button with progress visualization */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full h-11 font-semibold text-sm transition-all duration-200 ${
              canSubmit
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center space-y-2 w-full">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{encryptionProgress || 'Joining Battle...'}</span>
                </div>
                {encryptionStep > 0 && (
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-white via-blue-100 to-white h-1.5 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                      style={{ width: `${(encryptionStep / 4) * 100}%` }}
                    >
                      {encryptionStep === 2 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                <span>Join Battle Royale</span>
              </>
            )}
          </Button>
          
          {/* Wallet and system status messages */}
          {(!ready || !authenticated) && (
            <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-red-600 font-medium">
                Please connect your wallet to submit votes
              </p>
            </div>
          )}
          
          {!initialized && ready && authenticated && (
            <div className="text-center p-2 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-700 font-medium">
                Setting up FHEVM encryption...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

SubmissionForm.displayName = 'SubmissionForm';

export { SubmissionForm };
export default SubmissionForm;
