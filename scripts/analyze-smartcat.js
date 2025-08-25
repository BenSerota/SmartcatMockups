const puppeteer = require('puppeteer');

async function analyzeSmartcatDesign() {
  console.log('🔍 Analyzing Smartcat website design...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport for consistent analysis
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('📡 Loading Smartcat website...');
    await page.goto('https://smartcat.com', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    console.log('✅ Website loaded successfully!\n');

    // Extract design information
    const analysis = await page.evaluate(() => {
      const getComputedStyles = (element) => {
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
      const backgrounds = new Set();
      const textColors = new Set();
      const primaryColors = new Set();

      allElements.forEach(el => {
        const styles = getComputedStyles(el);
        if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)' && styles.backgroundColor !== 'transparent') {
          backgrounds.add(styles.backgroundColor);
        }
        if (styles.color && styles.color !== 'rgba(0, 0, 0, 0)' && styles.color !== 'transparent') {
          textColors.add(styles.color);
        }
      });

      // Extract CSS variables
      const cssVariables = {};
      const rootStyles = getComputedStyles(document.documentElement);
      for (let i = 0; i < document.documentElement.style.length; i++) {
        const property = document.documentElement.style[i];
        if (property.startsWith('--')) {
          cssVariables[property] = document.documentElement.style.getPropertyValue(property);
        }
      }

      // Extract component patterns
      const buttons = Array.from(document.querySelectorAll('button, .btn, [role="button"], a[href]')).map(btn => ({
        text: btn.textContent?.trim().substring(0, 50),
        tagName: btn.tagName.toLowerCase(),
        classes: btn.className,
        styles: getComputedStyles(btn),
      }));

      const inputs = Array.from(document.querySelectorAll('input, textarea, select')).map(input => ({
        type: input.type || 'text',
        placeholder: input.placeholder || '',
        classes: input.className,
        styles: getComputedStyles(input),
      }));

      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(heading => ({
        level: heading.tagName.toLowerCase(),
        text: heading.textContent?.trim().substring(0, 100),
        classes: heading.className,
        styles: getComputedStyles(heading),
      }));

      // Extract fonts
      const fonts = new Set();
      allElements.forEach(el => {
        const styles = getComputedStyles(el);
        if (styles.fontFamily) {
          fonts.add(styles.fontFamily);
        }
      });

      // Extract layout information
      const containers = Array.from(document.querySelectorAll('[class*="container"], [class*="wrapper"], [class*="section"]')).map(container => ({
        tagName: container.tagName.toLowerCase(),
        classes: container.className,
        styles: getComputedStyles(container),
      }));

      return {
        colors: {
          backgrounds: Array.from(backgrounds).slice(0, 20),
          textColors: Array.from(textColors).slice(0, 20),
        },
        typography: {
          fonts: Array.from(fonts).slice(0, 10),
        },
        components: {
          buttons: buttons.slice(0, 10),
          inputs: inputs.slice(0, 5),
          headings: headings.slice(0, 10),
          containers: containers.slice(0, 5),
        },
        cssVariables,
        pageTitle: document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.content || '',
      };
    });

    console.log('🎨 Smartcat Design Analysis Results:\n');

    // Display results
    console.log('📄 Page Information:');
    console.log(`   Title: ${analysis.pageTitle}`);
    console.log(`   Description: ${analysis.metaDescription}\n`);

    console.log('🎨 Color Palette:');
    console.log('   Background Colors:');
    analysis.colors.backgrounds.forEach((color, index) => {
      console.log(`     ${index + 1}. ${color}`);
    });
    console.log('\n   Text Colors:');
    analysis.colors.textColors.forEach((color, index) => {
      console.log(`     ${index + 1}. ${color}`);
    });

    console.log('\n📝 Typography:');
    console.log('   Fonts Used:');
    analysis.typography.fonts.forEach((font, index) => {
      console.log(`     ${index + 1}. ${font}`);
    });

    console.log('\n🔘 Components:');
    console.log(`   Buttons: ${analysis.components.buttons.length} found`);
    console.log(`   Inputs: ${analysis.components.inputs.length} found`);
    console.log(`   Headings: ${analysis.components.headings.length} found`);
    console.log(`   Containers: ${analysis.components.containers.length} found`);

    console.log('\n📋 Sample Buttons:');
    analysis.components.buttons.slice(0, 5).forEach((btn, index) => {
      console.log(`   ${index + 1}. ${btn.tagName} - "${btn.text}" (${btn.classes})`);
    });

    console.log('\n📋 Sample Headings:');
    analysis.components.headings.slice(0, 5).forEach((heading, index) => {
      console.log(`   ${index + 1}. ${heading.level} - "${heading.text}"`);
    });

    if (Object.keys(analysis.cssVariables).length > 0) {
      console.log('\n🎛️ CSS Variables:');
      Object.entries(analysis.cssVariables).slice(0, 10).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    }

    console.log('\n✅ Analysis complete!');

  } catch (error) {
    console.error('❌ Error analyzing Smartcat website:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the analysis
analyzeSmartcatDesign().catch(console.error);
