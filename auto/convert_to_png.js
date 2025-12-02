const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function convertHTMLtoPNG() {
    console.log('🎨 Converting HTML infographics to PNG...\n');

    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const baseDir = path.join(__dirname, '..', '..');
    const infographicsDir = path.join(baseDir, 'ROSE', 'infographics');
    const outputDir = path.join(infographicsDir, 'png');

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const htmlFiles = [
        { file: '01_executive_summary.html', name: '01_executive_summary.png', width: 1200, height: 1600 },
        { file: '02_security_assessment.html', name: '02_security_assessment.png', width: 1200, height: 2400 },
        { file: '03_performance_analysis.html', name: '03_performance_analysis.png', width: 1200, height: 2600 },
        { file: '04_scalability_evaluation.html', name: '04_scalability_evaluation.png', width: 1200, height: 2800 },
        { file: '05_poster.html', name: '05_poster.png', width: 1400, height: 2400 },
        { file: 'visual_dashboard.html', name: 'visual_dashboard.png', width: 1600, height: 3500 }
    ];

    for (const htmlFile of htmlFiles) {
        const page = await context.newPage();
        const htmlPath = path.join(infographicsDir, htmlFile.file);
        const outputPath = path.join(outputDir, htmlFile.name);

        console.log(`📸 Converting ${htmlFile.file}...`);

        // Set viewport for this specific file
        await page.setViewportSize({
            width: htmlFile.width,
            height: htmlFile.height
        });

        // Navigate to the HTML file
        await page.goto(`file://${htmlPath}`);

        // Wait for any animations to complete
        await page.waitForTimeout(2000);

        // Take screenshot
        await page.screenshot({
            path: outputPath,
            fullPage: true,
            type: 'png'
        });

        console.log(`   ✅ Saved: ${htmlFile.name}`);

        await page.close();
    }

    await browser.close();

    console.log('\n🎉 All infographics converted to PNG!');
    console.log(`📁 Location: ${outputDir}`);
    console.log('\nGenerated files:');
    htmlFiles.forEach(f => console.log(`   - ${f.name}`));
}

convertHTMLtoPNG().catch(console.error);
