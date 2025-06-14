
export interface OverlayConfig {
  position: 'top' | 'bottom' | 'center';
  style: 'subtitle' | 'popup' | 'sidebar';
  autoHide: boolean;
  duration?: number;
}

export interface SuggestionOverlay {
  id: string;
  text: string;
  type: 'answer' | 'tip' | 'warning' | 'success';
  priority: 'low' | 'medium' | 'high';
  framework?: string;
  confidence: number;
}

export class OverlayService {
  private overlays: Map<string, HTMLElement> = new Map();
  private container: HTMLElement | null = null;
  private currentConfig: OverlayConfig = {
    position: 'top',
    style: 'subtitle',
    autoHide: true,
    duration: 8000
  };

  constructor() {
    this.createOverlayContainer();
    this.injectStyles();
  }

  private createOverlayContainer() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'candidai-overlay-container';
    this.container.setAttribute('data-candidai', 'true');
    
    // High z-index to appear above meeting platforms
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    document.body.appendChild(this.container);
  }

  private injectStyles() {
    const styleId = 'candidai-overlay-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .candidai-overlay {
        pointer-events: auto;
        border-radius: 12px;
        padding: 12px 16px;
        margin: 8px;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        animation: candidai-slide-in 0.3s ease-out;
        transition: all 0.3s ease;
        font-size: 14px;
        line-height: 1.4;
      }

      .candidai-overlay.subtitle {
        background: rgba(0, 0, 0, 0.85);
        color: white;
        text-align: center;
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        max-width: 80%;
      }

      .candidai-overlay.popup {
        background: rgba(255, 255, 255, 0.95);
        color: #1a1a1a;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      .candidai-overlay.sidebar {
        background: linear-gradient(135deg, rgba(236, 72, 153, 0.95), rgba(244, 63, 94, 0.95));
        color: white;
        position: fixed;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        max-width: 320px;
      }

      .candidai-overlay.answer {
        border-left: 4px solid #10b981;
      }

      .candidai-overlay.tip {
        border-left: 4px solid #3b82f6;
      }

      .candidai-overlay.warning {
        border-left: 4px solid #f59e0b;
      }

      .candidai-overlay.success {
        border-left: 4px solid #10b981;
      }

      .candidai-overlay-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        font-weight: 600;
        font-size: 12px;
        opacity: 0.8;
      }

      .candidai-overlay-content {
        font-weight: 500;
      }

      .candidai-overlay-footer {
        margin-top: 8px;
        font-size: 11px;
        opacity: 0.7;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .candidai-close-btn {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 4px;
        opacity: 0.7;
        transition: opacity 0.2s;
      }

      .candidai-close-btn:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.1);
      }

      @keyframes candidai-slide-in {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes candidai-fade-out {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
          transform: translateY(-10px);
        }
      }

      .candidai-overlay.hiding {
        animation: candidai-fade-out 0.3s ease-in;
      }
    `;

    document.head.appendChild(style);
  }

  showSuggestion(suggestion: SuggestionOverlay): void {
    if (!this.container) return;

    // Remove existing overlay with same priority to avoid clutter
    this.overlays.forEach((overlay, id) => {
      if (overlay.dataset.priority === suggestion.priority) {
        this.hideSuggestion(id);
      }
    });

    const overlay = this.createOverlayElement(suggestion);
    this.overlays.set(suggestion.id, overlay);
    this.container.appendChild(overlay);

    // Auto-hide if configured
    if (this.currentConfig.autoHide && this.currentConfig.duration) {
      setTimeout(() => {
        this.hideSuggestion(suggestion.id);
      }, this.currentConfig.duration);
    }
  }

  private createOverlayElement(suggestion: SuggestionOverlay): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = `candidai-overlay ${this.currentConfig.style} ${suggestion.type}`;
    overlay.dataset.id = suggestion.id;
    overlay.dataset.priority = suggestion.priority;

    const typeIcons = {
      answer: '💡',
      tip: '📝',
      warning: '⚠️',
      success: '✅'
    };

    overlay.innerHTML = `
      <div class="candidai-overlay-header">
        <span>${typeIcons[suggestion.type]} ${suggestion.type.toUpperCase()}</span>
        <button class="candidai-close-btn" onclick="this.closest('.candidai-overlay').remove()">✕</button>
      </div>
      <div class="candidai-overlay-content">
        ${suggestion.text}
      </div>
      <div class="candidai-overlay-footer">
        <span>${suggestion.framework ? `${suggestion.framework.toUpperCase()} framework` : 'AI Assistant'}</span>
        <span>${suggestion.confidence}% confidence</span>
      </div>
    `;

    this.positionOverlay(overlay);
    return overlay;
  }

  private positionOverlay(overlay: HTMLElement): void {
    switch (this.currentConfig.position) {
      case 'top':
        overlay.style.position = 'fixed';
        overlay.style.top = '20px';
        overlay.style.left = '50%';
        overlay.style.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        overlay.style.position = 'fixed';
        overlay.style.bottom = '20px';
        overlay.style.left = '50%';
        overlay.style.transform = 'translateX(-50%)';
        break;
      case 'center':
        overlay.style.position = 'fixed';
        overlay.style.top = '50%';
        overlay.style.left = '50%';
        overlay.style.transform = 'translate(-50%, -50%)';
        break;
    }
  }

  hideSuggestion(id: string): void {
    const overlay = this.overlays.get(id);
    if (overlay) {
      overlay.classList.add('hiding');
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        this.overlays.delete(id);
      }, 300);
    }
  }

  hideAllSuggestions(): void {
    this.overlays.forEach((_, id) => {
      this.hideSuggestion(id);
    });
  }

  updateConfig(config: Partial<OverlayConfig>): void {
    this.currentConfig = { ...this.currentConfig, ...config };
  }

  getConfig(): OverlayConfig {
    return { ...this.currentConfig };
  }
}

export const overlayService = new OverlayService();
