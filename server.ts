import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI if key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('CleanConnect: Server-side Gemini AI initialized.');
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
  }
}

// Rule-based fallback algorithms when API key is unconfigured or offline
function ruleBasedCategorySuggester(desc: string) {
  const d = desc.toLowerCase();
  if (d.includes('battery') || d.includes('electronic') || d.includes('screen') || d.includes('computer') || d.includes('cable') || d.includes('e-waste')) {
    return {
      category: 'e_waste_hazard',
      confidence: 0.92,
      reason: 'Detected electronic hardware and battery components requiring specialized reclamation.',
      suggestedPriority: 'urgent',
    };
  }
  if (d.includes('concrete') || d.includes('drywall') || d.includes('rubble') || d.includes('construction') || d.includes('brick') || d.includes('plaster')) {
    return {
      category: 'construction_debris',
      confidence: 0.89,
      reason: 'Identified building material masonry requiring heavy vehicle dispatch.',
      suggestedPriority: 'medium',
    };
  }
  if (d.includes('drain') || d.includes('culvert') || d.includes('gutter') || d.includes('stormwater') || d.includes('flood') || d.includes('blocked pipe')) {
    return {
      category: 'blocked_drainage',
      confidence: 0.94,
      reason: 'Drainage blockage detected with potential street flooding hazard.',
      suggestedPriority: 'high',
    };
  }
  if (d.includes('chemical') || d.includes('oil') || d.includes('paint') || d.includes('toxic') || d.includes('solvent') || d.includes('gas')) {
    return {
      category: 'hazardous_chemicals',
      confidence: 0.95,
      reason: 'Potential chemical or volatile substance identified. HazMat triage advised.',
      suggestedPriority: 'urgent',
    };
  }
  if (d.includes('branch') || d.includes('leaf') || d.includes('leaves') || d.includes('tree') || d.includes('grass') || d.includes('pruning')) {
    return {
      category: 'green_waste',
      confidence: 0.85,
      reason: 'Identified plant, tree, or lawn organic clippings.',
      suggestedPriority: 'low',
    };
  }
  if (d.includes('plastic') || d.includes('bottle') || d.includes('cup') || d.includes('packaging') || d.includes('wrapper') || d.includes('styrofoam')) {
    return {
      category: 'plastic_waste',
      confidence: 0.88,
      reason: 'Identified single-use polymer packaging and beverage litter.',
      suggestedPriority: 'medium',
    };
  }
  if (d.includes('overflow') || d.includes('full bin') || d.includes('spill') || d.includes('canister') || d.includes('trash can')) {
    return {
      category: 'overflowing_bins',
      confidence: 0.91,
      reason: 'Public receptacle capacity exceeded.',
      suggestedPriority: 'high',
    };
  }
  return {
    category: 'illegal_littering',
    confidence: 0.78,
    reason: 'General debris accumulation reported on public pathway.',
    suggestedPriority: 'medium',
  };
}

// 1. Health & Config status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    aiEnabled: Boolean(aiClient),
    provider: aiClient ? 'Google Gemini (gemini-3.8-flash)' : 'Rule-Based Civic Expert Engine',
    timestamp: new Date().toISOString(),
  });
});

// 2. Suggest Waste Category
app.post('/api/ai/suggest-category', async (req: Request, res: Response) => {
  const { description } = req.body;
  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Missing description string' });
  }

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an automated civic waste triage classifier. Analyze this resident complaint description:
"${description}"

Select the most accurate category from this exact list:
['overflowing_bins', 'illegal_littering', 'plastic_waste', 'construction_debris', 'e_waste_hazard', 'hazardous_chemicals', 'blocked_drainage', 'green_waste']

Return a valid JSON object matching this structure:
{
  "category": "one_of_the_categories_above",
  "confidence": 0.85,
  "reason": "1-sentence explanation of why this category fits",
  "suggestedPriority": "low | medium | high | urgent"
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        ...parsed,
        provider: 'Google Gemini',
      });
    } catch (err) {
      console.warn('Gemini API call failed, using rule-based fallback:', err);
    }
  }

  const fallback = ruleBasedCategorySuggester(description);
  return res.json({
    ...fallback,
    provider: 'Rule-Based Engine (Demo Mode)',
  });
});

// 3. Suggest Next Action / Triage Steps
app.post('/api/ai/suggest-next-steps', async (req: Request, res: Response) => {
  const { complaint } = req.body;
  if (!complaint) {
    return res.status(400).json({ error: 'Missing complaint object' });
  }

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are a municipal dispatch coordinator advisor.
Complaint details:
Category: ${complaint.category}
Title: ${complaint.title}
Location: ${complaint.location}
Description: ${complaint.description}
Current Status: ${complaint.status}

Recommend the next operational step for civic sanitation staff.
Output JSON:
{
  "recommendedAction": "e.g. Dispatch Zone 4 compacting truck",
  "priorityRecommendation": "low | medium | high | urgent",
  "reasoning": "Brief operational justification",
  "estimatedResolutionHours": 24,
  "equipmentNeeded": ["e.g. pressure washer", "heavy debris loader"]
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        ...parsed,
        provider: 'Google Gemini',
      });
    } catch (err) {
      console.warn('Gemini dispatch suggestion failed, falling back:', err);
    }
  }

  // Fallback operational guidance
  return res.json({
    recommendedAction: complaint.category === 'e_waste_hazard'
      ? 'Route to Certified Electronics & Hazardous Materials Division'
      : complaint.category === 'blocked_drainage'
      ? 'Alert Stormwater Maintenance & Culvert Clearance Crew'
      : 'Assign Rapid Response Crew for next scheduled route sweep',
    priorityRecommendation: complaint.priority || 'medium',
    reasoning: 'Standard operating triage rule applied based on category impact.',
    estimatedResolutionHours: complaint.priority === 'urgent' ? 6 : 24,
    equipmentNeeded: ['Standard Sanitation Truck', 'Safety High-Vis Kit'],
    provider: 'Rule-Based Operational Engine',
  });
});

// 4. Recycling Q&A Guidance
app.post('/api/ai/recycling-assistant', async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are CleanConnect's AI Recycling Guide Assistant for community residents.
User asks: "${query}"

Provide clear, eco-accurate advice:
Output JSON:
{
  "itemName": "brief name of the item",
  "isRecyclable": true or false,
  "binType": "Blue Paper/Cardboard | Green Commingled Container | Brown Organics | Hazardous Dropoff | Landfill Trash",
  "prepInstructions": "How to prepare it (e.g. rinse, remove caps, keep dry)",
  "contaminationWarning": "Key pitfall to avoid (e.g. food residue)",
  "quickTip": "Short friendly tip"
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        ...parsed,
        provider: 'Google Gemini',
      });
    } catch (err) {
      console.warn('Recycling assistant API error:', err);
    }
  }

  // Fallback recycling rules
  const q = query.toLowerCase();
  let bin = 'Green Commingled Container';
  let recyclable = true;
  let prep = 'Rinse lightly and ensure free of loose liquids.';
  let warn = 'Keep food grease and soft shopping bags out.';

  if (q.includes('pizza') || q.includes('box')) {
    recyclable = false;
    bin = 'Brown Organics (compost greasy part) or Trash';
    prep = 'Tear off the clean lid for paper recycling; discard cheese-stained bottom.';
    warn = 'Grease contaminates paper recycling batches.';
  } else if (q.includes('battery') || q.includes('phone') || q.includes('laptop')) {
    recyclable = true;
    bin = 'Hazardous Dropoff Bay';
    prep = 'Tape battery terminals with clear tape; do NOT throw into curbside bins.';
    warn = 'Severe fire hazard in compaction trucks.';
  } else if (q.includes('plastic bag') || q.includes('film') || q.includes('bubble wrap')) {
    recyclable = false;
    bin = 'Supermarket Dropoff Bin or Trash';
    prep = 'Take soft plastics to grocery store collection bins; never place in home blue/green bins.';
    warn = 'Plastic film tangles and shuts down municipal sorting machinery.';
  }

  return res.json({
    itemName: query,
    isRecyclable: recyclable,
    binType: bin,
    prepInstructions: prep,
    contaminationWarning: warn,
    quickTip: 'When in doubt, check our comprehensive category guide below.',
    provider: 'Civic Recycling Rulebook',
  });
});

// 5. Admin Trend Summarizer
app.post('/api/ai/summarize-trends', async (req: Request, res: Response) => {
  const { complaints } = req.body;
  if (!Array.isArray(complaints)) {
    return res.status(400).json({ error: 'Expected complaints array' });
  }

  if (aiClient && complaints.length > 0) {
    try {
      const summaryList = complaints.map(c => `[${c.ticket_code}] ${c.category}: ${c.title} (${c.location}) - Status: ${c.status}`).join('\n');
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an urban environmental analytics assistant. Analyze these current civic waste complaints:
${summaryList}

Provide an executive briefing for municipal sanitation leaders.
Output JSON:
{
  "executiveSummary": "2-3 sentences summarizing current civic sanitation trends",
  "identifiedHotspots": ["list of repeated locations or zones"],
  "recurringBottlenecks": ["e.g. slow e-waste pickup, overflowing bins on weekends"],
  "recommendedCivicActions": ["3 actionable priority steps for public works"]
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        ...parsed,
        provider: 'Google Gemini',
      });
    } catch (err) {
      console.warn('Trend summarizer error:', err);
    }
  }

  // Fallback summary calculated from counts
  const categories: Record<string, number> = {};
  complaints.forEach(c => {
    categories[c.category] = (categories[c.category] || 0) + 1;
  });
  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'overflowing_bins';

  return res.json({
    executiveSummary: `Analysis of ${complaints.length} active complaints shows elevated reports in the ${topCategory.replace('_', ' ')} sector. Rapid response crews maintain steady resolution velocities across public parks.`,
    identifiedHotspots: ['Riverside Community Park', 'High Street Central Median', 'Oakwood Overpass corridor'],
    recurringBottlenecks: ['Heavy debris requires coordinated loader dispatch', 'Weekend pedestrian surges near public recreation trails'],
    recommendedCivicActions: [
      'Deploy supplemental high-capacity solar compactors to high-traffic park gates.',
      'Schedule targeted e-waste amnesty weekend collection drop-off.',
      'Coordinate culvert debris clearance before scheduled rain events.',
    ],
    provider: 'Statistical Analytics Engine',
  });
});

// 6. Detect Potential Duplicates
app.post('/api/ai/detect-duplicates', (req: Request, res: Response) => {
  const { targetComplaint, complaintsList } = req.body;
  if (!targetComplaint || !Array.isArray(complaintsList)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  // Simple heuristic duplicate detection: same category + similar location words
  const targetWords = (targetComplaint.location + ' ' + targetComplaint.title).toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);

  const duplicates = complaintsList
    .filter(c => c.id !== targetComplaint.id)
    .map(c => {
      let score = 0;
      if (c.category === targetComplaint.category) score += 40;
      const otherWords = (c.location + ' ' + c.title).toLowerCase().split(/\s+/);
      const common = targetWords.filter(w => otherWords.includes(w));
      score += Math.min(60, common.length * 20);

      return {
        ticket_code: c.ticket_code,
        title: c.title,
        status: c.status,
        similarity_score: Math.min(100, score),
        reason: score > 50 ? `Shared category (${c.category}) and matching location cues.` : 'Low correlation.',
      };
    })
    .filter(item => item.similarity_score >= 50)
    .sort((a, b) => b.similarity_score - a.similarity_score);

  return res.json({
    duplicates,
    count: duplicates.length,
    provider: 'Civic Geolocation & Semantic Matcher',
  });
});

// Vite / static asset mounting
async function startServer() {
  const distPath = path.join(__dirname, 'dist');
  const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(distPath, 'index.html'));

  if (isProduction && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CleanConnect platform online at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
