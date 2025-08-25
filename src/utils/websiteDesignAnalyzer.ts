import puppeteer from 'puppeteer';

export interface DesignAnalysis {
  colors: {
    primary: string[];
    secondary: string[];
    background: string[];
    text: string[];
  };
  typography: {
    fonts: string[];
    fontSizes: string[];
    lineHeights: string[];
  };
  layout: {
    maxWidths: string[];
    spacing: string[];
    breakpoints: string[];
  };
  components: {
    buttons: any[];
    inputs: any[];
    cards: any[];
    navigation: any[];
  };
  cssVariables: Record<string, string>;
  rawCSS: string;
}

export class WebsiteDesignAnalyzer {
  private browser: puppeteer.Browser | null = null;

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async analyzeWebsite(url: string): Promise<DesignAnalysis> {
    if (!this.browser) {
      await this.init();
    }

    const page = await this.browser!.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Extract design information
      const analysis = await page.evaluate(() => {
        const getComputedStyles = (element: Element) => {
          const styles = window.getComputedStyle(element);
          return {
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            fontSize: styles.fontSize,
            fontFamily: styles.fontFamily,
            lineHeight: styles.lineHeight,
            maxWidth: styles.maxWidth,
            padding: styles.padding,
            margin: styles.margin,
            borderRadius: styles.borderRadius,
            boxShadow: styles.boxShadow,
          };
        };

        // Extract colors
        const allElements = document.querySelectorAll('*');
        const colors = new Set<string>();
        const backgrounds = new Set<string>();
        const textColors = new Set<string>();

        allElements.forEach(el => {
          const styles = getComputedStyles(el);
          if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            backgrounds.add(styles.backgroundColor);
          }
          if (styles.color && styles.color !== 'rgba(0, 0, 0, 0)') {
            textColors.add(styles.color);
          }
        });

        // Extract CSS variables
        const cssVariables: Record<string, string> = {};
        const rootStyles = getComputedStyles(document.documentElement);
        for (let i = 0; i < document.documentElement.style.length; i++) {
          const property = document.documentElement.style[i];
          if (property.startsWith('--')) {
            cssVariables[property] = document.documentElement.style.getPropertyValue(property);
          }
        }

        // Extract component patterns
        const buttons = Array.from(document.querySelectorAll('button, .btn, [role="button"]')).map(btn => ({
          text: btn.textContent?.trim(),
          styles: getComputedStyles(btn),
          classes: btn.className,
        }));

        const inputs = Array.from(document.querySelectorAll('input, textarea, select')).map(input => ({
          type: (input as HTMLInputElement).type,
          placeholder: (input as HTMLInputElement).placeholder,
          styles: getComputedStyles(input),
          classes: input.className,
        }));

        const cards = Array.from(document.querySelectorAll('.card, [class*="card"], [class*="Card"]')).map(card => ({
          content: card.textContent?.trim().substring(0, 100),
          styles: getComputedStyles(card),
          classes: card.className,
        }));

        // Extract all CSS
        const stylesheets = Array.from(document.styleSheets);
        let rawCSS = '';
        stylesheets.forEach(sheet => {
          try {
            const rules = Array.from(sheet.cssRules || sheet.rules);
            rules.forEach(rule => {
              rawCSS += rule.cssText + '\n';
            });
          } catch (e) {
            // Cross-origin stylesheets will throw errors
          }
        });

        return {
          colors: {
            primary: Array.from(backgrounds).slice(0, 10),
            secondary: Array.from(backgrounds).slice(10, 20),
            background: Array.from(backgrounds),
            text: Array.from(textColors),
          },
          typography: {
            fonts: Array.from(new Set(Array.from(allElements).map(el => getComputedStyles(el).fontFamily))),
            fontSizes: Array.from(new Set(Array.from(allElements).map(el => getComputedStyles(el).fontSize))),
            lineHeights: Array.from(new Set(Array.from(allElements).map(el => getComputedStyles(el).lineHeight))),
          },
          layout: {
            maxWidths: Array.from(new Set(Array.from(allElements).map(el => getComputedStyles(el).maxWidth))),
            spacing: Array.from(new Set(Array.from(allElements).map(el => getComputedStyles(el).padding))),
            breakpoints: [], // Would need to analyze media queries
          },
          components: {
            buttons,
            inputs,
            cards,
            navigation: [],
          },
          cssVariables,
          rawCSS,
        };
      });

      return analysis;
    } finally {
      await page.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
