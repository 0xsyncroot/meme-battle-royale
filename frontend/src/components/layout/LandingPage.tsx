'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { WalletConnect } from '@/components/features/WalletConnect';
import { 
  Shield, 
  Users, 
  Eye, 
  Lock, 
  Sparkles,
  Trophy,
  CheckCircle,
  Zap
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="space-y-6 mt-6">
      {/* Hero Section */}
      <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 shadow-lg">
        <CardContent className="p-6 mt-4">
          <div className="text-center mb-5">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <h1 className="text-2xl font-bold text-slate-800">Meme Battle Royale</h1>
              <Trophy className="h-6 w-6 text-yellow-500" />
            </div>
            <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mb-4">
              🎮 <strong>Secret meme battle!</strong> Vote for your favorite meme template and write the funniest caption.
              <br />
              🔒 All votes are <strong>fully encrypted</strong> using Zama's FHEVM technology!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
              <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200 px-2 py-1 text-xs">
                <Shield className="h-3 w-3 mr-1" />
                100% Private
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 px-2 py-1 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Fair & Fun
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 px-2 py-1 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                FHEVM Powered
              </Badge>
            </div>
          </div>

          {/* Key Features Grid */}
          <div className="grid md:grid-cols-3 gap-3 mb-5">
            <div className="p-3 bg-white/80 rounded-lg border border-purple-100 hover:shadow-md transition-all">
              <Eye className="h-5 w-5 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-800 text-center text-sm mb-1">Secret Voting</h3>
              <p className="text-xs text-purple-700 text-center">Nobody sees your choice during battle</p>
            </div>
            <div className="p-3 bg-white/80 rounded-lg border border-purple-100 hover:shadow-md transition-all">
              <Users className="h-5 w-5 text-indigo-600 mx-auto mb-2" />
              <h3 className="font-semibold text-indigo-800 text-center text-sm mb-1">Fair Play</h3>
              <p className="text-xs text-indigo-700 text-center">No cheating or manipulation possible</p>
            </div>
            <div className="p-3 bg-white/80 rounded-lg border border-purple-100 hover:shadow-md transition-all">
              <Sparkles className="h-5 w-5 text-amber-600 mx-auto mb-2" />
              <h3 className="font-semibold text-amber-800 text-center text-sm mb-1">Creative Fun</h3>
              <p className="text-xs text-amber-700 text-center">Express your meme creativity freely</p>
            </div>
          </div>

          {/* Connect Section */}
          <div className="text-center">
            <WalletConnect />
            <p className="text-xs text-slate-500 mt-2">
              Connect your wallet to join the privacy-preserving meme battle
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How to Play */}
      <Card className="border border-slate-200 shadow-md mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-center gap-2 text-lg font-semibold text-slate-800">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>How to Play</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { 
                step: '1', 
                icon: Trophy, 
                title: 'Choose Meme', 
                desc: 'Browse available meme templates and pick your favorite',
                color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
              },
              { 
                step: '2', 
                icon: Lock, 
                title: 'Write Caption', 
                desc: 'Create the funniest text for your chosen meme',
                color: 'bg-purple-100 text-purple-700 border-purple-200'
              },
              { 
                step: '3', 
                icon: Shield, 
                title: 'Submit Vote', 
                desc: 'Your vote is encrypted on your device - completely private',
                color: 'bg-green-100 text-green-700 border-green-200'
              },
              { 
                step: '4', 
                icon: Users, 
                title: 'Watch Battle', 
                desc: 'See participant count in real-time (votes stay secret)',
                color: 'bg-blue-100 text-blue-700 border-blue-200'
              },
              { 
                step: '5', 
                icon: Eye, 
                title: 'Get Results', 
                desc: 'When battle ends, all votes are decrypted and results revealed',
                color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
              }
            ].map((item, i) => (
              <div key={i} className={`p-3 rounded-lg border ${item.color} transition-all hover:shadow-sm`}>
                <div className="text-center">
                  <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full font-bold text-xs mb-2 mx-auto">
                    {item.step}
                  </div>
                  <item.icon className={`h-4 w-4 mb-1 mx-auto`} />
                  <h4 className="font-semibold text-xs mb-1">{item.title}</h4>
                  <p className="text-[11px] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FHEVM Technology Explanation */}
      <Card className="border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-md mt-6">
        <CardContent className="p-4 mt-4">
          <div className="text-center mb-4">
            <Lock className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-indigo-800">🔐 Why Completely Private?</h3>
            <p className="text-indigo-700 text-sm mt-1">Powered by Zama's FHEVM - Advanced Fully Homomorphic Encryption</p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-white/80 p-3 rounded-lg border border-indigo-100">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-indigo-800 text-sm mb-1">Encrypted on Your Device</h4>
                  <p className="text-xs text-indigo-700">Votes are encrypted before sending to blockchain</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 p-3 rounded-lg border border-indigo-100">
              <div className="flex items-start gap-2">
                <Eye className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-indigo-800 text-sm mb-1">Compute on Encrypted Data</h4>
                  <p className="text-xs text-indigo-700">Smart contract counts votes without decrypting them</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 p-3 rounded-lg border border-indigo-100">
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-indigo-800 text-sm mb-1">No Cheating Possible</h4>
                  <p className="text-xs text-indigo-700">Even admins can't see who voted for what during battle</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 p-3 rounded-lg border border-indigo-100">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-indigo-800 text-sm mb-1">Transparent Results</h4>
                  <p className="text-xs text-indigo-700">Automatic decryption and reveal after battle completion</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
