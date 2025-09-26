export interface MemeTemplate {
  id: number;
  name: string;
  image: string;
  description: string;
}

export interface CaptionSubmission {
  submitter: string;
  templateId: number;
  encryptedCaption: string;
  allowPublicReveal: boolean;
  timestamp: number;
  index: number;
}

export interface ContestInfo {
  active: boolean;
  endsAt: number;
  templates: number;
  totalSubmissions: number;
  battleNumber?: number;
}

export interface EncryptedVote {
  templateId: number;
  encryptedData: string;
  proof: string;
}

export interface DecryptedResults {
  voteCounts: number[];
  winner: number;
  revealed: boolean;
}

export interface BattleHistoryItem {
  revealed: boolean;
  winnerTemplateId: number;
  winnerCaptionId: number;
  winnerVotes: number;
  battleNumber: number;
  endTimestamp: number;
  totalParticipants: number;
}
