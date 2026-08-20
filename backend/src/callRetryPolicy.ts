export type RetryDecision={state:'retry'|'failed';delaySeconds:number;reason:'attempts_exhausted'|'provider_failover'|'permanent_error'|'transient_error'};

const permanentPatterns=[
  /invalid (?:destination|number|phone|caller)/i,
  /not (?:a )?valid e\.164/i,
  /verified caller/i,
  /country (?:is )?not (?:enabled|allowed)/i,
  /policy (?:blocked|denied|review)/i,
  /(?:status|failed) \((?:400|401|403|404|422)\)/i,
  /authentication|unauthorized|forbidden/i,
];

export function retryDecision(attemptCount:number,maxAttempts:number,error:unknown,providerCount=1):RetryDecision{
  const nextAttempt=attemptCount+1;
  if(nextAttempt>=maxAttempts)return {state:'failed',delaySeconds:0,reason:'attempts_exhausted'};
  const message=error instanceof Error?error.message:String(error??'unknown error');
  if(permanentPatterns.some(pattern=>pattern.test(message))){if(providerCount>1&&nextAttempt<providerCount)return {state:'retry',delaySeconds:0,reason:'provider_failover'};return {state:'failed',delaySeconds:0,reason:'permanent_error'}}
  return {state:'retry',delaySeconds:Math.min(3600,30*2**Math.max(0,attemptCount)),reason:'transient_error'};
}
