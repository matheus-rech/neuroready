# Deploy NeuroReady to Hugging Face Spaces

## Quick Deploy (5 minutes)

### Step 1: Create the Space

1. Go to https://huggingface.co/new-space
2. Fill in the form:
   - **Owner**: Your username (matheus-rech)
   - **Space name**: `neuroready`
   - **License**: Apache 2.0
   - **Select the SDK**: Choose **Docker**
   - **Space hardware**: CPU basic (free) or upgrade for better performance
   - **Visibility**: Public

3. Click **Create Space**

### Step 2: Connect to GitHub

1. In your new Space, click on **Settings**
2. Scroll to **Repository** section
3. Click **Link to GitHub**
4. Select your repository: `matheus-rech/neuroready`
5. Branch: `main`
6. Click **Link**

### Step 3: Configure Dockerfile

1. In Space settings, find **Docker** section
2. Set **Dockerfile path**: `Dockerfile.ai`
3. Save changes

### Step 4: Add Secrets (IMPORTANT!)

1. In Space settings, scroll to **Repository secrets**
2. Click **New secret** and add:

   **Secret 1:**
   - Name: `ANTHROPIC_API_KEY`
   - Value: `[Your Anthropic API key]`

   **Secret 2:**
   - Name: `ELEVENLABS_API_KEY`
   - Value: `[Your ElevenLabs API key]`

3. Click **Add** for each secret

### Step 5: Deploy

1. The Space will automatically build and deploy
2. Wait 5-10 minutes for the build to complete
3. Your app will be live at: `https://huggingface.co/spaces/matheus-rech/neuroready`

---

## Alternative: Manual Git Push

If you prefer to push directly to Hugging Face:

```bash
# Add Hugging Face remote
cd /home/ubuntu/appoint-ready
git remote add hf https://huggingface.co/spaces/matheus-rech/neuroready
git push hf main
```

---

## Configuration Details

### Dockerfile

The Space will use `Dockerfile.ai` which:
- Builds the React frontend
- Installs Python dependencies
- Configures the AI backend
- Exposes port 7860
- Runs with Gunicorn

### Environment Variables

The following are automatically set by Hugging Face:
- `PORT=7860` (default Space port)
- `SPACE_ID=matheus-rech/neuroready`

You need to add as secrets:
- `ANTHROPIC_API_KEY` - For Claude AI conversations
- `ELEVENLABS_API_KEY` - For text-to-speech

### Resource Requirements

**Minimum (Free tier):**
- CPU: 2 cores
- RAM: 16GB
- Storage: 50GB

**Recommended (Paid tier):**
- CPU: 4 cores
- RAM: 32GB
- Storage: 100GB
- For faster AI responses and better performance

---

## Troubleshooting

### Build Fails

1. Check **Build logs** in Space settings
2. Common issues:
   - Missing dependencies → Check `requirements-deploy.txt`
   - Node build errors → Check `frontend/package.json`
   - Docker errors → Check `Dockerfile.ai`

### App Doesn't Start

1. Check **Container logs**
2. Verify secrets are set correctly
3. Ensure API keys are valid

### AI Features Not Working

1. Verify `ANTHROPIC_API_KEY` is set
2. Verify `ELEVENLABS_API_KEY` is set
3. Check API key quotas/limits
4. View logs for error messages

### Slow Performance

1. Upgrade to paid hardware tier
2. Reduce conversation turns
3. Disable TTS if not needed

---

## Post-Deployment

### Test the Application

1. Visit your Space URL
2. Click "Select Patient"
3. Choose a patient and condition
4. Start an interview
5. Verify AI responses work
6. Test neurological localization
7. Generate and evaluate a report

### Monitor Usage

1. Check Space analytics
2. Monitor API usage:
   - Anthropic dashboard
   - ElevenLabs dashboard
3. Watch for rate limits

### Update the Application

```bash
# Make changes locally
git add .
git commit -m "Your update message"

# Push to GitHub (will auto-deploy to Space)
git push neuroready main
```

---

## Cost Estimates

### Hugging Face Spaces
- **Free tier**: CPU basic (sufficient for demo)
- **Paid tier**: $0.60/hour for better performance

### API Costs (Approximate)
- **Anthropic Claude**: ~$0.01-0.02 per conversation
- **ElevenLabs**: ~$0.30 per 1000 characters

**Estimated monthly cost for moderate use:**
- Hosting: $0-50 (depending on tier)
- AI APIs: $10-100 (depending on usage)

---

## Security Notes

### API Keys
- ✅ Stored as Hugging Face secrets (encrypted)
- ✅ Not visible in code or logs
- ✅ Only accessible to your Space

### Data Privacy
- Patient data is simulated (not real)
- Conversations are not stored permanently
- FHIR data is synthetic

### Compliance
- This is a demo/educational tool
- Not HIPAA compliant
- Not for clinical use
- Additional development needed for production

---

## Customization

### Change Patients

Edit `neuro_patients.json` and `frontend/public/assets/patients_and_conditions.json`

### Change AI Model

In `ai_conversation.py`, modify:
```python
self.model = "claude-3-5-sonnet-20241022"  # Change to different Claude model
```

### Change Voices

In `tts_service.py`, modify the `voice_map` dictionary

### Disable Features

To disable TTS (reduce costs):
```python
# In app_ai.py
tts_service = None  # Set to None to disable
```

---

## Support

### Documentation
- Main README: `README_DEPLOYMENT.md`
- Integration Guide: `INTEGRATION_GUIDE.md`
- Quick Start: `QUICKSTART.md`
- Status: `AI_INTEGRATION_STATUS.md`

### GitHub Repository
https://github.com/matheus-rech/neuroready

### Issues
Create an issue on GitHub for bugs or feature requests

---

## Next Steps After Deployment

1. ✅ **Test thoroughly** - Try all features
2. ✅ **Complete frontend integration** - Connect AI components to UI
3. ✅ **Add patient images** - Enhance visual experience
4. ✅ **Implement FHIR viewer** - Add JSON popup
5. ✅ **Add details popup** - Explain the technology
6. ✅ **Monitor usage** - Track API costs
7. ✅ **Gather feedback** - Improve based on user input

---

## Quick Reference

**GitHub**: https://github.com/matheus-rech/neuroready  
**Space URL**: https://huggingface.co/spaces/matheus-rech/neuroready  
**Dockerfile**: `Dockerfile.ai`  
**Main App**: `app_ai.py`  
**Port**: 7860

**Required Secrets:**
- `ANTHROPIC_API_KEY`
- `ELEVENLABS_API_KEY`

**Build Time**: ~5-10 minutes  
**Status**: Backend 100% ready, Frontend needs integration

---

Good luck with your deployment! 🚀
