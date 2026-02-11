// FunnelForge - Main Application Logic

class FunnelForge {
    constructor() {
        this.currentTemplate = null;
        this.templateData = null;
        this.currentSettings = {
            primaryColor: '#3b82f6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            headline: '',
            subheadline: '',
            buttonText: '',
            email: '',
            emailService: 'netlify'
        };

        this.init();
    }

    init() {
        // Load templates data
        const templatesScript = document.getElementById('templates-data');
        this.templateData = JSON.parse(templatesScript.textContent);

        // Bind event listeners
        this.bindEvents();
    }

    bindEvents() {
        // Template selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const templateId = e.currentTarget.getAttribute('data-template');
                this.selectTemplate(templateId);
            });
        });

        // Back to templates
        document.getElementById('back-to-templates').addEventListener('click', () => {
            this.showTemplateSelection();
        });

        // Form inputs
        document.getElementById('headline-input').addEventListener('input', (e) => {
            this.updateSetting('headline', e.target.value);
            this.updateCharacterCount('headline', e.target.value, 60);
        });

        document.getElementById('subheadline-input').addEventListener('input', (e) => {
            this.updateSetting('subheadline', e.target.value);
            this.updateCharacterCount('subheadline', e.target.value, 120);
        });

        document.getElementById('button-input').addEventListener('input', (e) => {
            this.updateSetting('buttonText', e.target.value);
        });

        document.getElementById('email-input').addEventListener('input', (e) => {
            this.updateSetting('email', e.target.value);
        });

        // Color pickers
        document.getElementById('primary-color').addEventListener('input', (e) => {
            this.updateSetting('primaryColor', e.target.value);
        });

        document.getElementById('background-color').addEventListener('input', (e) => {
            this.updateSetting('backgroundColor', e.target.value);
        });

        document.getElementById('text-color').addEventListener('input', (e) => {
            this.updateSetting('textColor', e.target.value);
        });

        // Email service selection
        document.getElementById('email-service').addEventListener('change', (e) => {
            this.updateSetting('emailService', e.target.value);
            this.updateIntegrationHelp(e.target.value);
        });

        // Preview mode buttons
        document.getElementById('preview-desktop').addEventListener('click', () => {
            this.setPreviewMode('desktop');
        });

        document.getElementById('preview-mobile').addEventListener('click', () => {
            this.setPreviewMode('mobile');
        });

        // Export button
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportHTML();
        });
    }

    selectTemplate(templateId) {
        this.currentTemplate = templateId;
        const template = this.templateData[templateId];

        // Load default values
        this.currentSettings.headline = template.defaults.headline;
        this.currentSettings.subheadline = template.defaults.subheadline;
        this.currentSettings.buttonText = template.defaults.buttonText;

        // Update form inputs
        document.getElementById('headline-input').value = this.currentSettings.headline;
        document.getElementById('subheadline-input').value = this.currentSettings.subheadline;
        document.getElementById('button-input').value = this.currentSettings.buttonText;

        // Update character counts
        this.updateCharacterCount('headline', this.currentSettings.headline, 60);
        this.updateCharacterCount('subheadline', this.currentSettings.subheadline, 120);

        // Show editor
        this.showEditor();

        // Update preview
        this.updatePreview();
    }

    showTemplateSelection() {
        document.getElementById('template-selection').classList.remove('hidden');
        document.getElementById('editor-screen').classList.add('hidden');
        document.getElementById('export-btn').classList.add('hidden');
        document.getElementById('back-to-templates').classList.add('hidden');
    }

    showEditor() {
        document.getElementById('template-selection').classList.add('hidden');
        document.getElementById('editor-screen').classList.remove('hidden');
        document.getElementById('export-btn').classList.remove('hidden');
        document.getElementById('back-to-templates').classList.remove('hidden');
    }

    updateSetting(key, value) {
        this.currentSettings[key] = value;
        this.updatePreview();
    }

    updateCharacterCount(field, text, maxLength) {
        const remaining = maxLength - text.length;
        const countElement = document.getElementById(`${field}-count`);
        countElement.textContent = remaining;
        countElement.style.color = remaining < 10 ? '#dc2626' : '#6b7280';
    }

    updateIntegrationHelp(service) {
        const helpElement = document.getElementById('integration-help');
        const helpTexts = {
            netlify: '<strong>Netlify Forms:</strong> Just deploy to Netlify - form submissions will appear in your dashboard automatically. No configuration needed.',
            formspree: '<strong>Formspree:</strong> Create a free account at formspree.io, create a form, and replace the form action with your Formspree endpoint.',
            convertkit: '<strong>ConvertKit:</strong> Create a form in ConvertKit, get the form URL, and replace the form action with your ConvertKit endpoint.',
            mailchimp: '<strong>Mailchimp:</strong> Create an embedded form in Mailchimp, copy the form action URL, and replace the default action.'
        };

        helpElement.innerHTML = helpTexts[service];
    }

    updatePreview() {
        if (!this.currentTemplate) return;

        const template = this.templateData[this.currentTemplate];
        let html = template.html;

        // Replace template variables
        html = html.replace(/\{\{headline\}\}/g, this.currentSettings.headline || template.defaults.headline);
        html = html.replace(/\{\{subheadline\}\}/g, this.currentSettings.subheadline || template.defaults.subheadline);
        html = html.replace(/\{\{buttonText\}\}/g, this.currentSettings.buttonText || template.defaults.buttonText);
        html = html.replace(/\{\{primaryColor\}\}/g, this.currentSettings.primaryColor);
        html = html.replace(/\{\{backgroundColor\}\}/g, this.currentSettings.backgroundColor);
        html = html.replace(/\{\{textColor\}\}/g, this.currentSettings.textColor);

        // Update email service integration
        html = this.updateEmailIntegration(html);

        // Update preview iframe
        const previewFrame = document.getElementById('preview-frame');
        previewFrame.srcdoc = html;
    }

    updateEmailIntegration(html) {
        const service = this.currentSettings.emailService;

        switch (service) {
            case 'netlify':
                // Netlify Forms - already configured in template
                break;
            case 'formspree':
                html = html.replace('data-netlify="true"', '');
                html = html.replace('action="#"', 'action="https://formspree.io/f/YOUR_FORM_ID"');
                break;
            case 'convertkit':
                html = html.replace('data-netlify="true"', '');
                html = html.replace('action="#"', 'action="https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe"');
                break;
            case 'mailchimp':
                html = html.replace('data-netlify="true"', '');
                html = html.replace('action="#"', 'action="https://YOUR_DOMAIN.us1.list-manage.com/subscribe/post"');
                break;
        }

        return html;
    }

    setPreviewMode(mode) {
        const container = document.getElementById('preview-container');
        const desktopBtn = document.getElementById('preview-desktop');
        const mobileBtn = document.getElementById('preview-mobile');
        const frame = document.getElementById('preview-frame');

        if (mode === 'mobile') {
            container.className = 'preview-mobile';
            frame.style.width = '375px';
            frame.style.maxWidth = '100%';

            desktopBtn.className = 'preview-mode-btn bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs';
            mobileBtn.className = 'preview-mode-btn bg-blue-600 text-white px-3 py-1 rounded text-xs';
        } else {
            container.className = 'preview-desktop';
            frame.style.width = '100%';

            desktopBtn.className = 'preview-mode-btn bg-blue-600 text-white px-3 py-1 rounded text-xs';
            mobileBtn.className = 'preview-mode-btn bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs';
        }
    }

    async exportHTML() {
        if (!this.currentTemplate) return;

        const template = this.templateData[this.currentTemplate];
        let html = template.html;

        // Replace template variables with final values
        html = html.replace(/\{\{headline\}\}/g, this.currentSettings.headline || template.defaults.headline);
        html = html.replace(/\{\{subheadline\}\}/g, this.currentSettings.subheadline || template.defaults.subheadline);
        html = html.replace(/\{\{buttonText\}\}/g, this.currentSettings.buttonText || template.defaults.buttonText);
        html = html.replace(/\{\{primaryColor\}\}/g, this.currentSettings.primaryColor);
        html = html.replace(/\{\{backgroundColor\}\}/g, this.currentSettings.backgroundColor);
        html = html.replace(/\{\{textColor\}\}/g, this.currentSettings.textColor);

        // Update email integration
        html = this.updateEmailIntegration(html);

        // Create README with setup instructions
        const readme = this.generateReadme();

        // Create ZIP file
        const zip = new JSZip();
        zip.file('index.html', html);
        zip.file('README.md', readme);

        // Generate and download
        try {
            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);

            const templateName = template.name.toLowerCase().replace(/\s+/g, '-');
            const timestamp = new Date().toISOString().split('T')[0];
            link.download = `funnel-${templateName}-${timestamp}.zip`;

            link.click();
            URL.revokeObjectURL(link.href);

            // Show success message
            this.showExportSuccess();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        }
    }

    generateReadme() {
        const template = this.templateData[this.currentTemplate];
        const serviceName = this.currentSettings.emailService;

        return `# ${template.name} Funnel

Generated by FunnelForge on ${new Date().toLocaleDateString()}

## What's Included

- \`index.html\` - Your complete landing page, ready to deploy
- \`README.md\` - This file with setup instructions

## Deployment Options

### Option 1: Netlify (Recommended)
1. Create a free account at [netlify.com](https://netlify.com)
2. Drag and drop your HTML file to deploy instantly
3. Form submissions will appear in your Netlify dashboard automatically

### Option 2: Vercel
1. Create a free account at [vercel.com](https://vercel.com)
2. Connect your GitHub repository or upload files directly
3. Your funnel will be live in seconds

### Option 3: GitHub Pages
1. Upload your HTML file to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Your funnel will be available at https://yourusername.github.io/repository-name

## Email Integration Setup

**Current Service: ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}**

${this.getEmailSetupInstructions(serviceName)}

## Customization

Your funnel is fully self-contained. To make changes:
1. Edit the HTML file in any text editor
2. Look for the CSS variables to change colors
3. Update the text content directly in the HTML
4. Re-deploy to see your changes

## Performance Notes

Your exported funnel is optimized for:
- ✅ Fast loading (< 100KB total size)
- ✅ Mobile responsiveness
- ✅ SEO-friendly structure
- ✅ Accessibility standards

## Support

Need help? Visit [funnelforge.example.com](https://funnelforge.example.com) for tutorials and tips.

---
*Created with ❤️ by FunnelForge*
`;
    }

    getEmailSetupInstructions(service) {
        const instructions = {
            netlify: `If you deploy to Netlify, your form is ready to go! Form submissions will appear in your Netlify dashboard under Forms.

No additional setup required.`,
            formspree: `1. Create a free account at [formspree.io](https://formspree.io)
2. Create a new form and get your form endpoint
3. In your HTML file, find the line: \`action="https://formspree.io/f/YOUR_FORM_ID"\`
4. Replace YOUR_FORM_ID with your actual Formspree form ID`,
            convertkit: `1. Log into your ConvertKit account
2. Create a new form and get the form URL
3. In your HTML file, find the line: \`action="https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe"\`
4. Replace YOUR_FORM_ID with your actual ConvertKit form ID`,
            mailchimp: `1. Log into your Mailchimp account
2. Create an embedded form for your list
3. Copy the form action URL from the generated code
4. In your HTML file, replace the action URL with your Mailchimp form action`
        };

        return instructions[service] || 'Please refer to your email service documentation for setup instructions.';
    }

    showExportSuccess() {
        // Create a temporary success message
        const message = document.createElement('div');
        message.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        message.textContent = '✅ Funnel exported successfully!';

        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 3000);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FunnelForge();
});

// Analytics and user experience tracking (privacy-friendly)
function trackEvent(event, properties) {
    // Simple analytics without personal data
    if (typeof gtag !== 'undefined') {
        gtag('event', event, properties);
    }
}

// Track template selections (no personal data)
document.addEventListener('click', (e) => {
    if (e.target.closest('.template-card')) {
        const templateId = e.target.closest('.template-card').getAttribute('data-template');
        trackEvent('template_selected', { template: templateId });
    }
});

// Service Worker for offline functionality (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
            console.log('SW registered: ', registration);
        }).catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}