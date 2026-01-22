
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface AdviceResponse {
  expertName: string;
  content: string;
  sources: GroundingChunk[];
}

export interface ExpertProfile {
  id: string;
  name: string;
  title: string;
  avatar: string;
  gradient: string;
  icon: string;
  description?: string;
  isCustom?: boolean;
}

export interface UserProfile {
  age: string;
  gender: string;
  dream: string;
}
