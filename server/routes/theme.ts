import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

const router = Router();

// Schema for validating theme updates
const themeSchema = z.object({
  primary: z.string(),
  variant: z.enum(['professional', 'tint', 'vibrant']),
  appearance: z.enum(['light', 'dark', 'system']),
  radius: z.number()
});

// Get current theme
router.get('/theme', async (req, res) => {
  try {
    const themeFile = path.join(process.cwd(), 'theme.json');
    const themeData = await fs.readFile(themeFile, 'utf8');
    res.json(JSON.parse(themeData));
  } catch (error) {
    console.error('Error reading theme file:', error);
    res.status(500).json({ error: 'Could not read theme file' });
  }
});

// Update theme
router.post('/theme', async (req, res) => {
  try {
    // Validate the request body
    const validationResult = themeSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid theme data', 
        details: validationResult.error.format() 
      });
    }
    
    const theme = validationResult.data;
    const themeFile = path.join(process.cwd(), 'theme.json');
    
    // Write the theme to the file
    await fs.writeFile(themeFile, JSON.stringify(theme, null, 2));
    
    res.json({ success: true, theme });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ error: 'Could not update theme file' });
  }
});

export default router;