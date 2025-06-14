
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  component?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: AppError;
  errorInfo?: any;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorWithSeverity extends AppError {
  severity: ErrorSeverity;
}

export class AppErrorClass extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly component?: string;
  public readonly timestamp: number;

  constructor(
    code: string,
    message: string,
    severity: ErrorSeverity = 'medium',
    component?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.component = component;
    this.timestamp = Date.now();
  }
}
