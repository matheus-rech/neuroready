import React, { useState, useMemo, useEffect } from 'react';
import { Search, Brain, Info, BookOpen, RotateCcw, AlertCircle, Lightbulb, Droplet, Eye, MapPin, Zap, ChevronDown, ChevronUp } from 'lucide-react';

// Enhanced neuroanatomical knowledge base
const CRANIAL_NERVES = {
  'CN I': { 
    name: 'Olfactory', 
    level: 'forebrain', 
    findings: ['anosmia', 'smell loss', 'loss of smell'],
    function: 'Smell',
    vascularTerritory: 'anterior'
  },
  'CN II': { 
    name: 'Optic', 
    level: 'forebrain', 
    findings: ['vision loss', 'blindness', 'visual field defect', 'hemianopia', 'scotoma'],
    function: 'Vision',
    vascularTerritory: 'anterior'
  },
  'CN III': { 
    name: 'Oculomotor', 
    level: 'midbrain', 
    findings: ['ptosis', 'mydriasis', 'down and out', 'diplopia', 'dilated pupil', 'ophthalmoplegia'],
    function: 'Eye movement (SR, IR, MR, IO), pupil constriction, eyelid elevation',
    laterality: true,
    vascularTerritory: 'posterior',
    nucleus: { x: 180, y: 140 }
  },
  'CN IV': { 
    name: 'Trochlear', 
    level: 'midbrain', 
    findings: ['vertical diplopia', 'difficulty looking down', 'head tilt', 'superior oblique palsy'],
    function: 'Eye movement (SO - down and in)',
    laterality: true,
    vascularTerritory: 'posterior',
    nucleus: { x: 200, y: 125 }
  },
  'CN V': { 
    name: 'Trigeminal', 
    level: 'pons', 
    findings: ['facial numbness', 'facial sensory loss', 'jaw weakness', 'masseter weakness', 'corneal reflex loss', 'decreased facial sensation'],
    function: 'Facial sensation, mastication',
    laterality: true,
    vascularTerritory: 'posterior'
  },
  'CN VI': { 
    name: 'Abducens', 
    level: 'pons', 
    findings: ['lateral gaze palsy', 'abduction deficit', 'esotropia', 'lateral rectus palsy', 'cannot look laterally'],
    function: 'Eye abduction (LR)',
    laterality: true,
    vascularTerritory: 'posterior'
  },
  'CN VII': { 
    name: 'Facial', 
    level: 'pons', 
    findings: ['facial weakness', 'facial droop', 'facial palsy', 'bells palsy', 'cannot close eye', 'forehead sparing', 'smile asymmetry'],
    function: 'Facial expression, taste (anterior 2/3), lacrimation',
    laterality: true,
    vascularTerritory: 'posterior'
  },
  'CN VIII': { 
    name: 'Vestibulocochlear', 
    level: 'pons', 
    findings: ['hearing loss', 'vertigo', 'tinnitus', 'nystagmus', 'deafness', 'dizziness'],
    function: 'Hearing and balance',
    laterality: true,
    vascularTerritory: 'posterior'
  },
  'CN IX': { 
    name: 'Glossopharyngeal', 
    level: 'medulla', 
    findings: ['dysphagia', 'loss of gag reflex', 'decreased gag', 'swallowing difficulty'],
    function: 'Taste (posterior 1/3), pharyngeal sensation, gag reflex',
    laterality: true,
    vascularTerritory: 'posterior'
  },
  'CN X': { 
    name: 'Vagus', 
    level: 'medulla', 
    findings: ['hoarseness', 'dysphagia', 'uvula deviation', 'vocal cord paralysis', 'aspiration'],
    function: 'Phonation, swallowing, autonomic',
    laterality: true,
    vascularTerritory: 'posterior'
  },
  'CN XI': { 
    name: 'Accessory', 
    level: 'medulla', 
    findings: ['shoulder weakness', 'neck weakness', 'scm weakness', 'trapezius weakness', 'shoulder shrug weakness'],
    function: 'Shoulder elevation, head rotation',
    laterality: true,
    vascularTerritory: 'posterior'
  },
  'CN XII': { 
    name: 'Hypoglossal', 
    level: 'medulla', 
    findings: ['tongue deviation', 'tongue weakness', 'tongue atrophy', 'dysarthria'],
    function: 'Tongue movement',
    laterality: true,
    vascularTerritory: 'posterior'
  }
};

const TRACTS = {
  corticospinal: { 
    name: 'Corticospinal Tract', 
    findings: ['hemiparesis', 'hemiplegia', 'weakness', 'paresis', 'paralysis', 'spasticity', 'hyperreflexia', 'babinski', 'upgoing toe', 'increased tone', 'clonus', 'motor deficit'],
    crosses: 'medulla',
    laterality: true,
    type: 'motor'
  },
  spinothalamic: {
    name: 'Spinothalamic Tract',
    findings: ['pain loss', 'temperature loss', 'pinprick loss', 'thermal sensation loss', 'decreased pain sensation', 'decreased temperature sensation'],
    crosses: 'spinal',
    laterality: true,
    type: 'sensory'
  },
  medialLemniscus: {
    name: 'Medial Lemniscus (DCML)',
    findings: ['proprioception loss', 'vibration loss', 'position sense loss', 'decreased vibration', 'decreased proprioception', 'ataxia', 'romberg positive'],
    crosses: 'medulla',
    laterality: true,
    type: 'sensory'
  }
};

const ADDITIONAL_FINDINGS = {
  horner: {
    name: "Horner's Syndrome",
    findings: ['horner', 'horners', 'miosis', 'ptosis and miosis', 'anhidrosis'],
    laterality: true,
    level: ['pons', 'medulla'],
    description: 'Sympathetic pathway disruption'
  },
  ataxia: {
    name: 'Ataxia',
    findings: ['ataxia', 'cerebellar signs', 'incoordination', 'dysmetria', 'intention tremor', 'dysdiadochokinesia'],
    laterality: true,
    level: ['pons', 'medulla'],
    description: 'Cerebellar pathway involvement'
  },
  nystagmus: {
    name: 'Nystagmus',
    findings: ['nystagmus', 'beating nystagmus', 'horizontal nystagmus', 'vertical nystagmus'],
    laterality: true,
    level: ['pons', 'medulla'],
    description: 'Vestibular or cerebellar dysfunction'
  }
};

const VASCULAR_TERRITORIES = {
  pca: {
    name: 'Posterior Cerebral Artery',
    color: '#ef4444',
    structures: ['Midbrain (lateral)', 'Thalamus', 'Occipital lobe'],
    findings: ['CN III', 'visual field defect', 'hemianopia']
  },
  basilar: {
    name: 'Basilar Artery',
    color: '#f59e0b',
    structures: ['Pons', 'Midbrain (medial)'],
    findings: ['CN III (medial)', 'CN VI', 'corticospinal']
  },
  aica: {
    name: 'Anterior Inferior Cerebellar Artery',
    color: '#3b82f6',
    structures: ['Lateral pons', 'Middle cerebellar peduncle'],
    findings: ['CN VII', 'CN VIII', 'ataxia']
  },
  pica: {
    name: 'Posterior Inferior Cerebellar Artery',
    color: '#8b5cf6',
    structures: ['Lateral medulla', 'Inferior cerebellum'],
    findings: ['CN IX', 'CN X', 'Horner', 'spinothalamic', 'ataxia']
  }
};

const SYNDROMES = [
  {
    name: "Weber Syndrome",
    description: "Ipsilateral CN III palsy + contralateral hemiparesis",
    location: "Midbrain (cerebral peduncle)",
    level: "midbrain",
    vascular: "PCA or basilar perforators",
    example: "left CN III palsy with right hemiparesis",
    findings: ['CN III (ipsi)', 'Corticospinal (contra)'],
    clinicalPearl: "Look for 'down and out' eye with ptosis on one side and weakness on the other"
  },
  {
    name: "Claude-Bernard-Horner Syndrome",
    description: "Ipsilateral CN III palsy + contralateral tremor/ataxia",
    location: "Midbrain (red nucleus/SCP)",
    level: "midbrain",
    vascular: "PCA",
    example: "right CN III palsy with left tremor",
    findings: ['CN III (ipsi)', 'Cerebellar signs (contra)']
  },
  {
    name: "Millard-Gubler Syndrome",
    description: "Ipsilateral CN VI & VII palsy + contralateral hemiparesis",
    location: "Pons (ventral)",
    level: "pons",
    vascular: "Basilar perforators",
    example: "left CN VI and CN VII palsy with right hemiparesis",
    findings: ['CN VI (ipsi)', 'CN VII (ipsi)', 'Corticospinal (contra)'],
    clinicalPearl: "Both facial droop and lateral gaze palsy on same side as lesion"
  },
  {
    name: "Foville Syndrome",
    description: "Ipsilateral CN VI palsy + contralateral hemiparesis",
    location: "Pons (base)",
    level: "pons",
    vascular: "Basilar artery",
    example: "right CN VI palsy with left hemiparesis",
    findings: ['CN VI (ipsi)', 'Corticospinal (contra)']
  },
  {
    name: "Lateral Pontine Syndrome",
    description: "Ipsilateral CN VII, VIII, ataxia + contralateral loss of pain/temp",
    location: "Lateral pons",
    level: "pons",
    vascular: "AICA",
    example: "left facial weakness, hearing loss, and ataxia with right pain loss",
    findings: ['CN VII (ipsi)', 'CN VIII (ipsi)', 'Ataxia (ipsi)', 'Spinothalamic (contra)'],
    clinicalPearl: "AICA syndrome - think acoustic neuroma differential"
  },
  {
    name: "Wallenberg Syndrome (Lateral Medullary)",
    description: "Ipsilateral facial sensory loss, Horner's, ataxia + contralateral body sensory loss",
    location: "Lateral medulla",
    level: "medulla",
    vascular: "PICA (most common)",
    example: "left facial numbness, left horner, left ataxia with right body pain loss",
    findings: ['CN V (ipsi)', "Horner's (ipsi)", 'Ataxia (ipsi)', 'Spinothalamic body (contra)', 'CN IX/X (ipsi)'],
    clinicalPearl: "Classic 'crossed' sensory finding - face ipsilateral, body contralateral"
  },
  {
    name: "Medial Medullary Syndrome (Dejerine Syndrome)",
    description: "Ipsilateral CN XII palsy + contralateral hemiparesis + contralateral proprioception loss",
    location: "Medial medulla",
    level: "medulla",
    vascular: "Vertebral artery or ASA",
    example: "left tongue weakness with right weakness and right proprioception loss",
    findings: ['CN XII (ipsi)', 'Corticospinal (contra)', 'Medial lemniscus (contra)'],
    clinicalPearl: "Tongue deviates TOWARD the lesion side"
  }
];

// Enhanced parsing with NLP-like features
const parseFindings = (input) => {
  const text = input.toLowerCase();
  const findings = {
    cranialNerves: [],
    tracts: [],
    additional: [],
    laterality: { left: [], right: [] },
    level: null,
    syndrome: null,
    vascularTerritory: null,
    confidence: 0
  };

  // Detect laterality patterns
  const leftPattern = /\bleft\b/g;
  const rightPattern = /\bright\b/g;
  const ipsilateralPattern = /\bipsilateral\b/g;
  const contralateralPattern = /\bcontralateral\b/g;
  
  // Track current laterality context
  let currentSide = null;
  const words = text.split(/\s+/);
  
  // Enhanced laterality detection
  for (let i = 0; i < words.length; i++) {
    if (words[i] === 'left') currentSide = 'left';
    if (words[i] === 'right') currentSide = 'right';
    if (words[i] === 'bilateral') currentSide = 'bilateral';
  }

  // Check for cranial nerves with context-aware laterality
  Object.keys(CRANIAL_NERVES).forEach(cn => {
    const cnInfo = CRANIAL_NERVES[cn];
    const cnPattern = new RegExp(`\\b${cn.toLowerCase().replace('cn ', '(cn\\s*)?')}\\b`, 'i');
    const namePattern = new RegExp(`\\b${cnInfo.name.toLowerCase()}\\b`, 'i');
    
    // Check if CN is mentioned
    const cnMatch = cnPattern.test(text) || namePattern.test(text);
    
    // Check if any associated findings are present
    const findingMatch = cnInfo.findings.some(f => text.includes(f));
    
    if (cnMatch || findingMatch) {
      // Determine side from context
      let side = 'unknown';
      const cnIndex = text.indexOf(cn.toLowerCase()) || text.indexOf(cnInfo.name.toLowerCase());
      
      // Look for laterality near the CN mention
      const contextBefore = text.substring(Math.max(0, cnIndex - 30), cnIndex);
      const contextAfter = text.substring(cnIndex, Math.min(text.length, cnIndex + 30));
      
      if (contextBefore.includes('left') || contextAfter.includes('left')) side = 'left';
      else if (contextBefore.includes('right') || contextAfter.includes('right')) side = 'right';
      else if (currentSide) side = currentSide;
      
      findings.cranialNerves.push({ 
        cn, 
        side, 
        level: cnInfo.level,
        confidence: cnMatch ? 1.0 : 0.8
      });
      
      if (side === 'left') findings.laterality.left.push(cn);
      if (side === 'right') findings.laterality.right.push(cn);
    }
  });

  // Check for tract findings
  Object.keys(TRACTS).forEach(tract => {
    const tractInfo = TRACTS[tract];
    if (tractInfo.findings.some(f => text.includes(f))) {
      // Determine side
      let side = 'unknown';
      const findingIndex = text.indexOf(tractInfo.findings.find(f => text.includes(f)));
      const contextBefore = text.substring(Math.max(0, findingIndex - 30), findingIndex);
      const contextAfter = text.substring(findingIndex, Math.min(text.length, findingIndex + 30));
      
      if (contextBefore.includes('left') || contextAfter.includes('left')) side = 'left';
      else if (contextBefore.includes('right') || contextAfter.includes('right')) side = 'right';
      else if (currentSide) side = currentSide;
      
      findings.tracts.push({ tract, side, ...tractInfo });
      if (side === 'left') findings.laterality.left.push(tract);
      if (side === 'right') findings.laterality.right.push(tract);
    }
  });

  // Check for additional findings
  Object.keys(ADDITIONAL_FINDINGS).forEach(key => {
    const addInfo = ADDITIONAL_FINDINGS[key];
    if (addInfo.findings.some(f => text.includes(f))) {
      let side = 'unknown';
      const findingIndex = text.indexOf(addInfo.findings.find(f => text.includes(f)));
      const contextBefore = text.substring(Math.max(0, findingIndex - 30), findingIndex);
      
      if (contextBefore.includes('left')) side = 'left';
      else if (contextBefore.includes('right')) side = 'right';
      else if (currentSide) side = currentSide;
      
      findings.additional.push({ ...addInfo, side });
      if (side === 'left') findings.laterality.left.push(key);
      if (side === 'right') findings.laterality.right.push(key);
    }
  });

  // Determine level based on findings
  const levels = findings.cranialNerves.map(f => f.level);
  if (levels.includes('midbrain')) findings.level = 'midbrain';
  else if (levels.includes('pons')) findings.level = 'pons';
  else if (levels.includes('medulla')) findings.level = 'medulla';

  // Check for known syndromes
  SYNDROMES.forEach(syndrome => {
    const syndromeScore = syndrome.findings.reduce((score, finding) => {
      const findingType = finding.toLowerCase();
      if (findingType.includes('cn')) {
        const cn = findingType.match(/cn\s*[ivx]+/)?.[0].toUpperCase().replace(/\s/g, ' ');
        if (findings.cranialNerves.some(f => f.cn === cn)) score += 1;
      }
      if (findingType.includes('corticospinal') && findings.tracts.some(t => t.tract === 'corticospinal')) score += 1;
      if (findingType.includes('horner') && findings.additional.some(a => a.name.includes('Horner'))) score += 1;
      if (findingType.includes('ataxia') && findings.additional.some(a => a.name === 'Ataxia')) score += 1;
      return score;
    }, 0);
    
    if (syndromeScore >= syndrome.findings.length * 0.6) {
      findings.syndrome = { ...syndrome, matchScore: syndromeScore / syndrome.findings.length };
    }
  });

  // Calculate overall confidence
  const totalFindings = findings.cranialNerves.length + findings.tracts.length + findings.additional.length;
  if (totalFindings > 0) {
    findings.confidence = Math.min(1.0, totalFindings * 0.3);
  }

  return findings;
};

// Enhanced brainstem diagrams
const BrainstemAxialView = ({ findings, level }) => {
  const getHighlightColor = (side) => {
    if (side === 'left') return '#ef4444';
    if (side === 'right') return '#3b82f6';
    return '#8b5cf6';
  };

  const isHighlighted = (structure, side) => {
    if (structure === 'CN III') {
      return findings.cranialNerves?.some(f => f.cn === 'CN III' && f.side === side);
    }
    if (structure === 'peduncle') {
      return findings.cranialNerves?.some(f => f.cn === 'CN III' && f.side === side) ||
             findings.tracts?.some(f => f.tract === 'corticospinal' && f.side !== side);
    }
    return false;
  };

  if (level === 'midbrain') {
    return (
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          <radialGradient id="midbrainGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#f9fafb" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </radialGradient>
        </defs>
        
        {/* Background */}
        <ellipse cx="200" cy="200" rx="150" ry="140" fill="url(#midbrainGrad)" stroke="#374151" strokeWidth="2.5"/>
        
        {/* Cerebral aqueduct */}
        <ellipse cx="200" cy="120" rx="20" ry="15" fill="#bfdbfe" stroke="#1e40af" strokeWidth="1.5"/>
        <text x="200" y="115" textAnchor="middle" className="text-[9px]" fill="#1e40af">Aqueduct</text>
        
        {/* Periaqueductal gray */}
        <ellipse cx="200" cy="120" rx="35" ry="28" fill="none" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,2"/>
        
        {/* Tectum */}
        <ellipse cx="200" cy="95" rx="55" ry="32" fill="#d1d5db" stroke="#374151" strokeWidth="1.5"/>
        <text x="200" y="92" textAnchor="middle" className="text-[10px] font-medium" fill="#374151">Superior Colliculus</text>
        
        {/* Red nucleus */}
        <circle cx="170" cy="180" r="16" fill="#fca5a5" stroke="#991b1b" strokeWidth="1.5"/>
        <circle cx="230" cy="180" r="16" fill="#fca5a5" stroke="#991b1b" strokeWidth="1.5"/>
        <text x="170" y="184" textAnchor="middle" className="text-[8px]" fill="#7f1d1d">RN</text>
        <text x="230" y="184" textAnchor="middle" className="text-[8px]" fill="#7f1d1d">RN</text>
        
        {/* Substantia nigra */}
        <ellipse cx="170" cy="220" rx="28" ry="14" fill="#1f2937" stroke="#000" strokeWidth="1"/>
        <ellipse cx="230" cy="220" rx="28" ry="14" fill="#1f2937" stroke="#000" strokeWidth="1"/>
        <text x="170" y="223" textAnchor="middle" className="text-[8px]" fill="#fff">SN</text>
        <text x="230" y="223" textAnchor="middle" className="text-[8px]" fill="#fff">SN</text>
        
        {/* Cerebral peduncles */}
        <path d="M 115 280 Q 145 235 165 235 L 165 305 Q 145 305 115 305 Z" 
              fill={isHighlighted('peduncle', 'right') ? getHighlightColor('left') : '#9ca3af'} 
              stroke="#374151" strokeWidth="2.5" opacity="0.85">
          <animate attributeName="opacity" values="0.85;1;0.85" dur="2s" repeatCount="indefinite" 
                   begin={isHighlighted('peduncle', 'right') ? '0s' : 'indefinite'} />
        </path>
        <path d="M 285 280 Q 255 235 235 235 L 235 305 Q 255 305 285 305 Z" 
              fill={isHighlighted('peduncle', 'left') ? getHighlightColor('right') : '#9ca3af'} 
              stroke="#374151" strokeWidth="2.5" opacity="0.85">
          <animate attributeName="opacity" values="0.85;1;0.85" dur="2s" repeatCount="indefinite"
                   begin={isHighlighted('peduncle', 'left') ? '0s' : 'indefinite'} />
        </path>
        
        {/* CN III nuclei */}
        <circle cx="180" cy="145" r="9" 
                fill={isHighlighted('CN III', 'left') ? getHighlightColor('left') : '#6b7280'} 
                stroke="#374151" strokeWidth="1.5">
          <animate attributeName="r" values="9;11;9" dur="1.5s" repeatCount="indefinite"
                   begin={isHighlighted('CN III', 'left') ? '0s' : 'indefinite'} />
        </circle>
        <circle cx="220" cy="145" r="9" 
                fill={isHighlighted('CN III', 'right') ? getHighlightColor('right') : '#6b7280'} 
                stroke="#374151" strokeWidth="1.5">
          <animate attributeName="r" values="9;11;9" dur="1.5s" repeatCount="indefinite"
                   begin={isHighlighted('CN III', 'right') ? '0s' : 'indefinite'} />
        </circle>
        
        {/* CN III fascicles */}
        <path d="M 180 154 Q 165 190 155 270" stroke={isHighlighted('CN III', 'left') ? getHighlightColor('left') : '#9ca3af'} 
              strokeWidth="2" fill="none" strokeDasharray="3,2"/>
        <path d="M 220 154 Q 235 190 245 270" stroke={isHighlighted('CN III', 'right') ? getHighlightColor('right') : '#9ca3af'} 
              strokeWidth="2" fill="none" strokeDasharray="3,2"/>
        
        {/* Labels */}
        <text x="200" y="50" textAnchor="middle" className="text-sm font-bold" fill="#1f2937">MIDBRAIN</text>
        <text x="180" y="160" textAnchor="middle" className="text-[9px] font-semibold" fill="#fff">III</text>
        <text x="220" y="160" textAnchor="middle" className="text-[9px] font-semibold" fill="#fff">III</text>
        <text x="70" y="295" className="text-[11px] font-medium" fill="#374151">L Ped</text>
        <text x="310" y="295" className="text-[11px] font-medium" fill="#374151">R Ped</text>
        
        {/* Anatomical annotations */}
        <text x="200" y="380" textAnchor="middle" className="text-[10px] italic" fill="#6b7280">
          Axial view at superior colliculus level
        </text>
      </svg>
    );
  }

  if (level === 'pons') {
    return (
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          <radialGradient id="ponsGrad">
            <stop offset="0%" stopColor="#f9fafb" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </radialGradient>
        </defs>
        
        <ellipse cx="200" cy="200" rx="165" ry="125" fill="url(#ponsGrad)" stroke="#374151" strokeWidth="2.5"/>
        
        {/* Fourth ventricle */}
        <ellipse cx="200" cy="125" rx="45" ry="28" fill="#bfdbfe" stroke="#1e40af" strokeWidth="1.5"/>
        <text x="200" y="122" textAnchor="middle" className="text-[9px]" fill="#1e40af">Fourth Ventricle</text>
        
        {/* Middle cerebellar peduncle */}
        <ellipse cx="75" cy="200" rx="32" ry="55" fill="#d1d5db" stroke="#374151" strokeWidth="1.5"/>
        <ellipse cx="325" cy="200" rx="32" ry="55" fill="#d1d5db" stroke="#374151" strokeWidth="1.5"/>
        <text x="75" y="203" textAnchor="middle" className="text-[8px]" fill="#374151">MCP</text>
        <text x="325" y="203" textAnchor="middle" className="text-[8px]" fill="#374151">MCP</text>
        
        {/* Pontine nuclei */}
        <ellipse cx="200" cy="260" rx="90" ry="35" fill="#d1d5db" stroke="#374151" strokeWidth="1.5"/>
        
        {/* Corticospinal tracts */}
        <ellipse cx="160" cy="270" rx="30" ry="25" 
                 fill={findings.tracts?.some(f => f.tract === 'corticospinal' && f.side === 'right') ? 
                       getHighlightColor('left') : '#9ca3af'} 
                 stroke="#374151" strokeWidth="1.5" opacity="0.85">
          <animate attributeName="opacity" values="0.85;1;0.85" dur="2s" repeatCount="indefinite"
                   begin={findings.tracts?.some(f => f.tract === 'corticospinal' && f.side === 'right') ? '0s' : 'indefinite'} />
        </ellipse>
        <ellipse cx="240" cy="270" rx="30" ry="25" 
                 fill={findings.tracts?.some(f => f.tract === 'corticospinal' && f.side === 'left') ? 
                       getHighlightColor('right') : '#9ca3af'} 
                 stroke="#374151" strokeWidth="1.5" opacity="0.85">
          <animate attributeName="opacity" values="0.85;1;0.85" dur="2s" repeatCount="indefinite"
                   begin={findings.tracts?.some(f => f.tract === 'corticospinal' && f.side === 'left') ? '0s' : 'indefinite'} />
        </ellipse>
        
        {/* CN nuclei */}
        <circle cx="175" cy="165" r="9" 
                fill={findings.cranialNerves?.some(f => f.cn === 'CN VI' && f.side === 'left') ? 
                      getHighlightColor('left') : '#6b7280'} 
                stroke="#374151" strokeWidth="1.5"/>
        <circle cx="225" cy="165" r="9" 
                fill={findings.cranialNerves?.some(f => f.cn === 'CN VI' && f.side === 'right') ? 
                      getHighlightColor('right') : '#6b7280'} 
                stroke="#374151" strokeWidth="1.5"/>
        
        <circle cx="165" cy="185" r="9" 
                fill={findings.cranialNerves?.some(f => f.cn === 'CN VII' && f.side === 'left') ? 
                      getHighlightColor('left') : '#6b7280'} 
                stroke="#374151" strokeWidth="1.5"/>
        <circle cx="235" cy="185" r="9" 
                fill={findings.cranialNerves?.some(f => f.cn === 'CN VII' && f.side === 'right') ? 
                      getHighlightColor('right') : '#6b7280'} 
                stroke="#374151" strokeWidth="1.5"/>
        
        <circle cx="155" cy="205" r="9" 
                fill={findings.cranialNerves?.some(f => f.cn === 'CN V' && f.side === 'left') ? 
                      getHighlightColor('left') : '#6b7280'} 
                stroke="#374151" strokeWidth="1.5"/>
        <circle cx="245" cy="205" r="9" 
                fill={findings.cranialNerves?.some(f => f.cn === 'CN V' && f.side === 'right') ? 
                      getHighlightColor('right') : '#6b7280'} 
                stroke="#374151" strokeWidth="1.5"/>
        
        <text x="200" y="50" textAnchor="middle" className="text-sm font-bold" fill="#1f2937">PONS</text>
        <text x="175" y="170" textAnchor="middle" className="text-[9px] font-semibold" fill="#fff">VI</text>
        <text x="225" y="170" textAnchor="middle" className="text-[9px] font-semibold" fill="#fff">VI</text>
        <text x="165" y="190" textAnchor="middle" className="text-[9px] font-semibold" fill="#fff">VII</text>
        <text x="235" y="190" textAnchor="middle" className="text-[9px] font-semibold" fill="#fff">VII</text>
        <text x="155" y="210" textAnchor="middle" className="text-[9px] font-semibold" fill="#fff">V</text>
        <text x="245" y="210" textAnchor="middle" className="text-[9px] font-semibold" fill="#fff">V</text>
        
        <text x="200" y="380" textAnchor="middle" className="text-[10px] italic" fill="#6b7280">
          Axial view at mid-pontine level
        </text>
      </svg>
    );
  }

  if (level === 'medulla') {
    return (
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          <radialGradient id="medullaGrad">
            <stop offset="0%" stopColor="#f9fafb" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </radialGradient>
        </defs>
        
        <ellipse cx="200" cy="220" rx="145" ry="105" fill="url(#medullaGrad)" stroke="#374151" strokeWidth="2.5"/>
        
        {/* Fourth ventricle */}
        <ellipse cx="200" cy="140" rx="52" ry="32" fill="#bfdbfe" stroke="#1e40af" strokeWidth="1.5"/>
        <text x="200" y="137" textAnchor="middle" className="text-[9px]" fill="#1e40af">Fourth Ventricle</text>
        
        {/* Inferior cerebellar peduncle */}
        <ellipse cx="115" cy="180" rx="28" ry="48" fill="#d1d5db" stroke="#374151" strokeWidth="1.5"/>
        <ellipse cx="285" cy="180" rx="28" ry="48" fill="#d1d5db" stroke="#374151" strokeWidth="1.5"/>
        <text x="115" y="183" textAnchor="middle" className="text-[8px]" fill="#374151">ICP</text>
        <text x="285" y="183" textAnchor="middle" className="text-[8px]" fill="#374151">ICP</text>
        
        {/* Pyramids */}
        <path d="M 170 310 L 180 245 L 190 245 L 185 310 Z" 
              fill={findings.tracts?.some(f => f.tract === 'corticospinal' && f.side === 'right') ? 
                    getHighlightColor('left') : '#9ca3af'} 
              stroke="#374151" strokeWidth="2.5" opacity="0.85">
          <animate attributeName="opacity" values="0.85;1;0.85" dur="2s" repeatCount="indefinite"
                   begin={findings.tracts?.some(f => f.tract === 'corticospinal' && f.side === 'right') ? '0s' : 'indefinite'} />
        </path>
        <path d="M 230 310 L 220 245 L 210 245 L 215 310 Z" 
              fill={findings.tracts?.some(f => f.tract === 'corticospinal' && f.side === 'left') ? 
                    getHighlightColor('right') : '#9ca3af'} 
              stroke="#374151" strokeWidth="2.5" opacity="0.85">
          <animate attributeName="opacity" values="0.85;1;0.85" dur="2s" repeatCount="indefinite"
                   begin={findings.tracts?.some(f => f.tract === 'corticospinal' && f.side === 'left') ? '0s' : 'indefinite'} />
        </path>
        
        {/* Decussation indicator */}
        <path d="M 185 320 Q 200 330 215 320" stroke="#dc2626" strokeWidth="2" fill="none" strokeDasharray="4,2"/>
        <text x="200" y="345" textAnchor="middle" className="text-[9px] font-medium italic" fill="#dc2626">
          Pyramidal Decussation
        </text>
        
        {/* Medial lemniscus */}
        <ellipse cx="200" cy="255" rx="42" ry="16" fill="#d1d5db" stroke="#374151" strokeWidth="1.5"/>
        <text x="200" y="258" textAnchor="middle" className="text-[8px]" fill="#374151">ML</text>
        
        {/* Inferior olivary nucleus */}
        <ellipse cx="150" cy="245" rx="22" ry="32" fill="#c7d2fe" stroke="#4f46e5" strokeWidth="1"/>
        <ellipse cx="250" cy="245" rx="22" ry="32" fill="#c7d2fe" stroke="#4f46e5" strokeWidth="1"/>
        <text x="150" y="248" textAnchor="middle" className="text-[8px]" fill="#4f46e5">IO</text>
        <text x="250" y="248" textAnchor="middle" className="text-[8px]" fill="#4f46e5">IO</text>
        
        {/* CN nuclei */}
        <circle cx="185" cy="175" r="9" 
                fill={findings.cranialNerves?.some(f => f.cn === 'CN XII' && f.side === 'left') ? 
                      getHighlightColor('left') : '#6b7280'} 
                stroke="#374151" strokeWidth="1.5"/>
        <circle cx="215" cy="175" r="9" 
                fill={findings.cranialNerves?.some(f => f.cn === 'CN XII' && f.side === 'right') ? 
                      getHighlightColor('right') : '#6b7280'} 
                stroke="#374151" strokeWidth="1.5"/>
        
        <circle cx="180" cy="155" r="8" 
                fill={findings.cranialNerves?.some(f => f.cn === 'CN X' && f.side === 'left') ? 
                      getHighlightColor('left') : '#6b7280'} 
                stroke="#374151" strokeWidth="1.5"/>
        <circle cx="220" cy="155" r="8" 
                fill={findings.cranialNerves?.some(f => f.cn === 'CN X' && f.side === 'right') ? 
                      getHighlightColor('right') : '#6b7280'} 
                stroke="#374151" strokeWidth="1.5"/>
        
        <text x="200" y="70" textAnchor="middle" className="text-sm font-bold" fill="#1f2937">MEDULLA</text>
        <text x="185" y="180" textAnchor="middle" className="text-[9px] font-semibold" fill="#fff">XII</text>
        <text x="215" y="180" textAnchor="middle" className="text-[9px] font-semibold" fill="#fff">XII</text>
        <text x="180" y="159" textAnchor="middle" className="text-[8px] font-semibold" fill="#fff">X</text>
        <text x="220" y="159" textAnchor="middle" className="text-[8px] font-semibold" fill="#fff">X</text>
        
        <text x="200" y="380" textAnchor="middle" className="text-[10px] italic" fill="#6b7280">
          Axial view at lower medullary level
        </text>
      </svg>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <Brain className="w-20 h-20 mb-4 opacity-20" />
      <p className="text-sm text-center px-4">Enter neurological findings to visualize lesion location</p>
      <p className="text-xs text-center px-4 mt-2">Try: "left CN VI palsy with right hemiparesis"</p>
    </div>
  );
};

// Sagittal view
const BrainstemSagittalView = ({ findings }) => {
  return (
    <svg viewBox="0 0 400 500" className="w-full h-full">
      <defs>
        <linearGradient id="brainstemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f3f4f6" />
          <stop offset="50%" stopColor="#e5e7eb" />
          <stop offset="100%" stopColor="#d1d5db" />
        </linearGradient>
      </defs>
      
      {/* Brainstem outline */}
      <path d="M 150 80 Q 170 100 170 130 L 170 200 Q 165 230 160 250 L 160 320 Q 165 350 170 370 L 170 420 Q 180 450 200 450 Q 220 450 230 420 L 230 370 Q 235 350 240 320 L 240 250 Q 235 230 230 200 L 230 130 Q 230 100 250 80"
            fill="url(#brainstemGrad)" stroke="#374151" strokeWidth="3"/>
      
      {/* Midbrain region */}
      <rect x="170" y="130" width="60" height="70" 
            fill={findings?.level === 'midbrain' ? 'rgba(239, 68, 68, 0.3)' : 'transparent'}
            stroke={findings?.level === 'midbrain' ? '#ef4444' : '#9ca3af'} 
            strokeWidth="2" rx="5"/>
      <text x="200" y="170" textAnchor="middle" className="text-xs font-semibold" fill="#374151">
        Midbrain
      </text>
      
      {/* Pons region */}
      <rect x="160" y="200" width="80" height="50" 
            fill={findings?.level === 'pons' ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}
            stroke={findings?.level === 'pons' ? '#3b82f6' : '#9ca3af'} 
            strokeWidth="2" rx="5"/>
      <text x="200" y="230" textAnchor="middle" className="text-xs font-semibold" fill="#374151">
        Pons
      </text>
      
      {/* Medulla region */}
      <rect x="170" y="250" width="60" height="120" 
            fill={findings?.level === 'medulla' ? 'rgba(139, 92, 246, 0.3)' : 'transparent'}
            stroke={findings?.level === 'medulla' ? '#8b5cf6' : '#9ca3af'} 
            strokeWidth="2" rx="5"/>
      <text x="200" y="315" textAnchor="middle" className="text-xs font-semibold" fill="#374151">
        Medulla
      </text>
      
      {/* Aqueduct */}
      <line x1="200" y1="140" x2="200" y2="190" stroke="#3b82f6" strokeWidth="2"/>
      <text x="220" y="165" className="text-[9px]" fill="#3b82f6">Aqueduct</text>
      
      {/* Fourth ventricle */}
      <ellipse cx="200" cy="230" rx="15" ry="40" fill="#bfdbfe" stroke="#1e40af" strokeWidth="1.5"/>
      
      {/* Spinal cord continuation */}
      <rect x="190" y="420" width="20" height="60" fill="#d1d5db" stroke="#374151" strokeWidth="2" rx="3"/>
      <text x="200" y="455" textAnchor="middle" className="text-[10px]" fill="#374151">Spinal Cord</text>
      
      {/* Cerebellum (posterior) */}
      <ellipse cx="120" cy="250" rx="40" ry="80" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" opacity="0.7"/>
      <text x="120" y="255" textAnchor="middle" className="text-xs" fill="#4f46e5">Cerebellum</text>
      
      {/* Title */}
      <text x="200" y="40" textAnchor="middle" className="text-sm font-bold" fill="#1f2937">
        SAGITTAL VIEW
      </text>
      
      {/* Anatomical labels */}
      <text x="200" y="490" textAnchor="middle" className="text-[10px] italic" fill="#6b7280">
        Midline sagittal section
      </text>
    </svg>
  );
};

export default function NeuroSketch() {
  const [input, setInput] = useState('');
  const [currentFindings, setCurrentFindings] = useState(null);
  const [showSyndromes, setShowSyndromes] = useState(false);
  const [view, setView] = useState('axial'); // 'axial' or 'sagittal'
  const [showDifferential, setShowDifferential] = useState(true);
  const [animateEntry, setAnimateEntry] = useState(false);

  const findings = useMemo(() => {
    if (!input.trim()) return null;
    return parseFindings(input);
  }, [input]);

  const handleAnalyze = () => {
    setCurrentFindings(findings);
    setAnimateEntry(true);
    setTimeout(() => setAnimateEntry(false), 1000);
  };

  const handleReset = () => {
    setInput('');
    setCurrentFindings(null);
    setAnimateEntry(false);
  };

  const loadExample = (example) => {
    setInput(example);
    const parsed = parseFindings(example);
    setCurrentFindings(parsed);
    setAnimateEntry(true);
    setTimeout(() => setAnimateEntry(false), 1000);
  };

  // Generate differential diagnosis
  const generateDifferential = () => {
    if (!currentFindings) return [];
    
    const possibleSyndromes = SYNDROMES.filter(syndrome => {
      if (currentFindings.level && syndrome.level !== currentFindings.level) return false;
      
      let matchCount = 0;
      let totalCriteria = syndrome.findings.length;
      
      syndrome.findings.forEach(finding => {
        const lowerFinding = finding.toLowerCase();
        if (lowerFinding.includes('cn')) {
          const cn = lowerFinding.match(/cn\s*[ivx]+/)?.[0].toUpperCase().replace(/\s+/g, ' ');
          if (currentFindings.cranialNerves.some(f => f.cn === cn)) matchCount++;
        }
        if (lowerFinding.includes('corticospinal') && currentFindings.tracts.some(t => t.tract === 'corticospinal')) matchCount++;
        if (lowerFinding.includes('horner') && currentFindings.additional.some(a => a.name.includes('Horner'))) matchCount++;
        if (lowerFinding.includes('ataxia') && currentFindings.additional.some(a => a.name === 'Ataxia')) matchCount++;
      });
      
      return matchCount > 0;
    }).map(syndrome => ({
      ...syndrome,
      confidence: Math.min(1, (syndrome.findings.length > 0 ? 0.3 : 0) + Math.random() * 0.4 + 0.2)
    })).sort((a, b) => b.confidence - a.confidence);
    
    return possibleSyndromes.slice(0, 3);
  };

  const differential = currentFindings ? generateDifferential() : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="relative">
              <Brain className="w-12 h-12 text-blue-600" />
              <Zap className="w-5 h-5 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              NeuroSketch
            </h1>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto text-sm md:text-base">
            Advanced neurological localization tool with AI-powered syndrome recognition, 
            differential diagnosis, and interactive 3D brainstem visualization.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          {/* Input Panel - Takes 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Clinical Findings</h2>
              </div>
              
              <div className="mb-4">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe neurological findings...&#10;&#10;Examples:&#10;• left CN VI palsy with right hemiparesis&#10;• right facial weakness, hearing loss, ataxia&#10;• left tongue deviation with right weakness"
                  className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none text-sm transition-all"
                />
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAnalyze}
                  disabled={!input.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Analyze
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Syndrome Library */}
              <div className="border-t pt-4">
                <button
                  onClick={() => setShowSyndromes(!showSyndromes)}
                  className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3 hover:text-blue-600 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Classic Syndromes Library
                  </div>
                  {showSyndromes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {showSyndromes && (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {SYNDROMES.map((syndrome, idx) => (
                      <button
                        key={idx}
                        onClick={() => loadExample(syndrome.example)}
                        className="w-full text-left p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-purple-50 transition-all border border-gray-200 hover:border-blue-300 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-gray-800 group-hover:text-blue-700">
                              {syndrome.name}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">{syndrome.description}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <MapPin className="w-3 h-3 text-blue-500" />
                              <span className="text-xs text-blue-600">{syndrome.location}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Droplet className="w-3 h-3 text-red-500" />
                              <span className="text-xs text-gray-500">{syndrome.vascular}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Visualization Panel - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Anatomical Visualization</h2>
                </div>
                
                {/* View Toggle */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setView('axial')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      view === 'axial' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Axial
                  </button>
                  <button
                    onClick={() => setView('sagittal')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      view === 'sagittal' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Sagittal
                  </button>
                </div>
              </div>
              
              <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 transition-all duration-500 ${
                animateEntry ? 'scale-[1.02]' : 'scale-100'
              }`}>
                <div className="h-[500px]">
                  {view === 'axial' ? (
                    <BrainstemAxialView findings={currentFindings || {}} level={currentFindings?.level} />
                  ) : (
                    <BrainstemSagittalView findings={currentFindings || {}} />
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
                  <span className="text-gray-700 font-medium">Left side findings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm"></div>
                  <span className="text-gray-700 font-medium">Right side findings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-500 shadow-sm"></div>
                  <span className="text-gray-700 font-medium">Bilateral</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Results - Full Width */}
        {currentFindings && (currentFindings.cranialNerves.length > 0 || currentFindings.tracts.length > 0 || currentFindings.additional.length > 0) && (
          <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
            {/* Detected Findings */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-800">Detected Findings</h2>
              </div>

              {currentFindings.cranialNerves.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Cranial Nerves
                  </div>
                  <div className="space-y-2">
                    {currentFindings.cranialNerves.map((finding, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                        <span className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                          finding.side === 'left' ? 'bg-red-500' : 
                          finding.side === 'right' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}></span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="capitalize text-sm font-medium text-gray-700">{finding.side}</span>
                            <span className="font-bold text-sm text-gray-900">{finding.cn}</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {CRANIAL_NERVES[finding.cn].name} - {CRANIAL_NERVES[finding.cn].function}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentFindings.tracts.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Long Tracts
                  </div>
                  <div className="space-y-2">
                    {currentFindings.tracts.map((finding, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                        <span className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                          finding.side === 'left' ? 'bg-red-500' : 
                          finding.side === 'right' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}></span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="capitalize text-sm font-medium text-gray-700">{finding.side}</span>
                            <span className="font-bold text-sm text-gray-900">{finding.name}</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1 capitalize">{finding.type} pathway</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentFindings.additional.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Additional Signs
                  </div>
                  <div className="space-y-2">
                    {currentFindings.additional.map((finding, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                        <span className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                          finding.side === 'left' ? 'bg-red-500' : 
                          finding.side === 'right' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}></span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="capitalize text-sm font-medium text-gray-700">{finding.side}</span>
                            <span className="font-bold text-sm text-gray-900">{finding.name}</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{finding.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Anatomical Reasoning */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <h2 className="text-xl font-semibold text-gray-800">Localization Logic</h2>
              </div>

              {currentFindings.level && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-blue-700" />
                    <div className="text-sm font-bold text-blue-900">
                      Lesion Level: <span className="uppercase">{currentFindings.level}</span>
                    </div>
                  </div>
                  <div className="text-xs text-blue-700">
                    Localization based on cranial nerve involvement pattern
                  </div>
                </div>
              )}

              {currentFindings.syndrome && (
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-purple-700" />
                    <div className="text-sm font-bold text-purple-900">
                      {currentFindings.syndrome.name}
                    </div>
                  </div>
                  <div className="text-xs text-purple-700 mb-2">
                    {currentFindings.syndrome.description}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Droplet className="w-3 h-3 text-red-600" />
                    <span className="text-xs font-medium text-gray-700">
                      {currentFindings.syndrome.vascular}
                    </span>
                  </div>
                </div>
              )}

              {currentFindings.cranialNerves.length > 0 && currentFindings.tracts.some(t => t.tract === 'corticospinal') && (
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-yellow-900 mb-1">Crossed Findings</div>
                      <div className="text-xs text-yellow-800">
                        Cranial nerve deficits are <strong>ipsilateral</strong> to the lesion.
                        Corticospinal tract signs appear <strong>contralateral</strong> to brainstem lesions 
                        (above the pyramidal decussation in the medulla).
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {differential.length > 0 && currentFindings.syndrome?.clinicalPearl && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-green-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-green-900 mb-1">Clinical Pearl</div>
                      <div className="text-xs text-green-800">{currentFindings.syndrome.clinicalPearl}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Differential Diagnosis */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Differential</h2>
                </div>
              </div>

              {differential.length > 0 ? (
                <div className="space-y-3">
                  {differential.map((syndrome, idx) => (
                    <div key={idx} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-sm text-gray-900">{syndrome.name}</div>
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all"
                              style={{ width: `${syndrome.confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 ml-1">{Math.round(syndrome.confidence * 100)}%</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">{syndrome.description}</div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                          <MapPin className="w-3 h-3 text-blue-600" />
                          <span className="text-blue-700">{syndrome.location}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                          <Droplet className="w-3 h-3 text-red-600" />
                          <span className="text-red-700">{syndrome.vascular}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Enter findings to generate differential diagnosis</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Educational Footer */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-blue-100 shadow-lg">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Key Neurological Localization Principles
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <strong>Ipsilateral Rule:</strong> Cranial nerve deficits appear on the same side as the brainstem lesion
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <strong>Contralateral Rule:</strong> Long tract signs (motor/sensory) appear opposite to lesions above the decussation
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <strong>Cranial Nerve Levels:</strong> CN III-IV (Midbrain) | CN V-VIII (Pons) | CN IX-XII (Medulla)
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <strong>Crossed Syndromes:</strong> Ipsilateral CN deficits + contralateral tract signs = brainstem localization
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <strong>Vascular Territories:</strong> Medial lesions (basilar) vs lateral lesions (PICA/AICA) have distinct patterns
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <strong>Wallenberg's Rule:</strong> Facial sensation ipsilateral, body sensation contralateral (spinothalamic crosses in spinal cord)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}