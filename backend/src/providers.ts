import { z } from 'zod';

export const telephonyProviders = ['twilio','telnyx','vonage','plivo','bandwidth','custom_sip'] as const;
export const ProviderConfig = z.object({
  provider: z.enum(telephonyProviders),
  displayName: z.string().min(2).max(80),
  secretRef: z.string().min(3).max(240),
  enabledCountries: z.array(z.string().regex(/^[A-Z]{2}$/)).min(1),
  defaultFromNumber: z.string().regex(/^\+[1-9]\d{6,14}$/).optional(),
  internationalEnabled: z.boolean().default(false),
  maxCps: z.number().positive().max(1000),
  maxChannels: z.number().int().positive().max(100000),
  failoverProviderId: z.string().uuid().nullable().default(null)
});

export const AiVoiceProfile = z.object({
  name: z.string().min(2).max(80),
  primaryLocale: z.string().regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/),
  supportedLocales: z.array(z.string().regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/)).min(1),
  allowCodeSwitching: z.boolean().default(true),
  sttProvider: z.string().min(2).max(60),
  ttsProvider: z.string().min(2).max(60),
  voiceId: z.string().min(1).max(160),
  fallbackVoiceId: z.string().min(1).max(160).nullable().default(null),
  speakingRate: z.number().min(0.5).max(2).default(1),
  pitch: z.number().min(-20).max(20).default(0),
  emotionAdaptation: z.boolean().default(false),
  avatar: z.object({
    characterName: z.string().min(2).max(80),
    persona: z.string().min(10).max(4000),
    visualAssetRef: z.string().max(240).nullable().default(null),
    videoAvatarProvider: z.string().max(60).nullable().default(null)
  })
});
