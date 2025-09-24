'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Shield, 
  Zap, 
  Users, 
  Eye, 
  Lock, 
  Sparkles,
  CheckCircle,
  Trophy,
  Code,
  Layers
} from 'lucide-react';
import { LobbyContentShimmer } from '@/components/ui/Shimmer';

export function LobbyContent() {
  const [isLoading] = useState(false);

  if (isLoading) {
    return <LobbyContentShimmer />;
  }

  return (
    <div className="space-y-3">
      {/* Hero Banner */}
      <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 shadow-lg">
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-3 mt-3">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <h1 className="text-xl font-bold text-slate-800">Meme Battle Royale</h1>
              <Trophy className="h-6 w-6 text-yellow-500" />
            </div>
            <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed mb-3">
              🎮 <strong>Secret meme battle!</strong> Vote for your favorite meme template and write the funniest caption.
              <br />
              🔒 All votes are <strong>fully encrypted</strong> - nobody knows what you voted until battle ends!
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200 px-2 py-1 text-xs">
                <Shield className="h-3 w-3 mr-1" />
                100% Private
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 px-2 py-1 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Fair & Fun
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-white/70 rounded-lg border border-purple-100">
              <Eye className="h-5 w-5 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-800 text-sm">Secret Voting</h3>
              <p className="text-xs text-purple-700">Nobody sees your choice</p>
            </div>
            <div className="p-3 bg-white/70 rounded-lg border border-purple-100">
              <Users className="h-5 w-5 text-indigo-600 mx-auto mb-2" />
              <h3 className="font-semibold text-indigo-800 text-sm">Fair Play</h3>
              <p className="text-xs text-indigo-700">No cheating possible</p>
            </div>
            <div className="p-3 bg-white/70 rounded-lg border border-purple-100">
              <Sparkles className="h-5 w-5 text-amber-600 mx-auto mb-2" />
              <h3 className="font-semibold text-amber-800 text-sm">Creative Fun</h3>
              <p className="text-xs text-amber-700">Express your meme creativity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Play */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>How to Play</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {[
              { 
                step: '1', 
                icon: Trophy, 
                title: 'Choose Your Favorite Meme', 
                desc: 'Browse available meme templates and pick the one you like most',
                color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
              },
              { 
                step: '2', 
                icon: Lock, 
                title: 'Write Funny Caption', 
                desc: 'Create the funniest text for your chosen meme - be creative!',
                color: 'bg-purple-100 text-purple-700 border-purple-200'
              },
              { 
                step: '3', 
                icon: Shield, 
                title: 'Submit Secret Vote', 
                desc: 'Your vote is encrypted on your device - completely private',
                color: 'bg-green-100 text-green-700 border-green-200'
              },
              { 
                step: '4', 
                icon: Users, 
                title: 'Watch Live Battle', 
                desc: 'See participant count in real-time (but not who voted what)',
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
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full font-bold text-xs">
                    {item.step}
                  </div>
                  <item.icon className={`h-4 w-4 mt-0.5 flex-shrink-0`} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                    <p className="text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Why FHEVM Magic? */}
      <Card className="border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
        <CardContent className="p-4">
          <div className="text-center mb-3 mt-3">
            <Lock className="h-5 w-5 text-indigo-600 mx-auto mb-2" />
            <h3 className="font-semibold text-indigo-800 text-base">🔐 Why Completely Private?</h3>
            <p className="text-indigo-700 text-xs mt-1">FHEVM - Advanced encryption technology</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white/70 p-3 rounded-lg border border-indigo-100">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-indigo-800 mb-1">Encrypted on Your Device</h4>
                  <p className="text-indigo-700">Votes are encrypted before sending to blockchain</p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 p-3 rounded-lg border border-indigo-100">
              <div className="flex items-start gap-2">
                <Eye className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-indigo-800 mb-1">Compute on Encrypted Data</h4>
                  <p className="text-indigo-700">Smart contract counts votes without decryption</p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 p-3 rounded-lg border border-indigo-100">
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-indigo-800 mb-1">No Cheating Possible</h4>
                  <p className="text-indigo-700">Even admins can't see who voted for what</p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 p-3 rounded-lg border border-indigo-100">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-indigo-800 mb-1">Transparent Results</h4>
                  <p className="text-indigo-700">Auto-decrypt and reveal after battle ends</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
