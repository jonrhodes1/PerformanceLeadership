/* Archetypes SPA logic */

const state = {
  archetypes: [],
  archetypeMap: {},
  goalRiskPace: [],
  goalRiskPaceMap: {},
  results: null,
  structural: null,
  selections: { primary: null, secondary: null },
  recency: {},
  templates: {},
  teamRows: [],
  teamMapOptions: {
    filter: 'All',
    showNames: true,
    showSecondary: true,
    role: 'All',
    selectedPerson: null,
  },
};

const elements = {
  sections: document.querySelectorAll('[data-section]'),
  navLinks: document.querySelectorAll('.nav-link'),
  completedBadge: document.getElementById('completedBadge'),
  assessment: document.getElementById('assessment'),
  structuralFlow: document.getElementById('structuralFlow'),
  lockInWrap: document.getElementById('lockInWrap'),
  lockInBtn: document.getElementById('lockInBtn'),
  resetBtn: document.getElementById('resetBtn'),
  resultsContent: document.getElementById('resultsContent'),
  teamGate: document.getElementById('teamGate'),
  teamContent: document.getElementById('teamContent'),
  navToggle: document.querySelector('.nav-toggle'),
  navMenu: document.querySelector('.site-nav'),
};

const STORAGE_KEY = 'archetypeResults';
const STRUCTURAL_KEY = 'archetypeStructuralProfile';
const TEAM_UNLOCK_KEY = 'unlockedTeam';

const preferenceStem = 'Select your most natural preference, then your second preference.';

const performanceLeadershipCopy = {
  Anchor: 'Best self brings calm structure and steady routines that make pressure predictable. Direct communication strengths include measured tone, clarity on standards, and a reassuring pace that lowers noise. A likely blind spot is waiting too long to surface tensions or challenge disruption. They elevate team standards by reinforcing consistency and protecting the habits that keep performance stable.',
  Connector: 'Best self creates cohesion and shared purpose, turning individuals into a unit. Direct communication strengths include inclusive language, emotional accuracy, and a talent for aligning people around common intent. A likely blind spot is over-consulting when a firm decision is required. They elevate team standards by strengthening trust so accountability can land without defensiveness.',
  Navigator: 'Best self offers direction, sequencing, and a clear definition of success when conditions change. Direct communication strengths include concise framing, options under pressure, and a steady tempo that keeps action aligned. A likely blind spot is over-control when uncertainty rises. They elevate team standards by turning ambiguity into a clear route that others can follow.',
  Guardian: 'Best self protects quality and risk controls when stakes are high. Direct communication strengths include evidence-led messages, precise detail, and clear thresholds for what is acceptable. A likely blind spot is slowing momentum in moments that need rapid action. They elevate team standards by making precision and safety a non-negotiable baseline.',
  Explorer: 'Best self opens new routes and keeps curiosity alive when others narrow. Direct communication strengths include forward-looking prompts, imagination with structure, and the ability to expand options without losing intent. A likely blind spot is drifting from consolidation once the best path emerges. They elevate team standards by challenging assumptions and keeping ambition high.',
  Energiser: 'Best self generates urgency and momentum, lifting effort when energy dips. Direct communication strengths include short, energising cues and a clear push toward action. A likely blind spot is over-driving pace when recovery is needed. They elevate team standards by setting a high tempo and rallying people to meet it.',
  Synchroniser: 'Best self aligns timing, roles, and handovers so the group moves as one. Direct communication strengths include crisp coordination, clear interfaces, and disciplined check-ins. A likely blind spot is over-coordination that slows decisiveness. They elevate team standards by making rhythm and timing feel non-negotiable.',
  'Decision-Maker': 'Best self commits quickly and clarifies accountability under pressure. Direct communication strengths include direct instruction, confident decision rules, and a focus on immediate action. A likely blind spot is reducing psychological safety with blunt delivery. They elevate team standards by demanding clear ownership and decisive follow-through.',
  Innovator: 'Best self introduces fresh angles and lifts ambition without losing purpose. Direct communication strengths include bold framing, creative challenge, and energising problem redefinitions. A likely blind spot is chasing novelty beyond what the team can execute. They elevate team standards by pushing the group beyond routine and into better solutions.',
};

const archetypeColours = {
  Anchor: '#1f77b4',
  Connector: '#ff7f0e',
  Navigator: '#2ca02c',
  Guardian: '#d62728',
  Explorer: '#9467bd',
  Energiser: '#8c564b',
  Synchroniser: '#e377c2',
  'Decision-Maker': '#7f7f7f',
  Innovator: '#bcbd22',
};

const structuralDiagnosticModel = {
  authority: {
    key: 'authority',
    title: 'Decision Authority Under Pressure',
    scenario: 'After several weeks of sustained workload, a high stakes decision must be made quickly. Under pressure and limited time, how are decisions most clearly made within your team?',
    scale: { minLabel: 'Informal Authority', maxLabel: 'Concentrated Authority' },
    options: [
      {
        code: 'A',
        label: 'Concentrated Authority',
        score: 5,
        text: 'One clearly designated leader makes the final call after brief consultation.',
        interpretation: 'Decision rights concentrate quickly, which accelerates action but can narrow dissent under fatigue.',
      },
      {
        code: 'B',
        label: 'Role-Based Authority',
        score: 4,
        text: 'The most relevant expert leads each decision, even if they are not the formal leader.',
        interpretation: 'Authority follows expertise, which protects technical quality but can weaken coordination when energy drops.',
      },
      {
        code: 'C',
        label: 'Shared Authority',
        score: 2,
        text: 'The team discusses rapidly and agrees before acting.',
        interpretation: 'Decisions are shared, which preserves cohesion but can slow action under pressure.',
      },
      {
        code: 'D',
        label: 'Informal Authority',
        score: 1,
        text: 'Whoever feels most confident steps forward and decides.',
        interpretation: 'Authority is informal, which can spark initiative but increases ambiguity and conflict under fatigue.',
      },
      {
        code: 'E',
        label: 'Conditional Authority',
        score: 3,
        text: 'Authority is generally shared, but shifts formally if predefined thresholds are crossed.',
        interpretation: 'Authority shifts at thresholds, which balances participation but can delay escalation when time is tight.',
      },
    ],
  },
  skill: {
    key: 'skill',
    title: 'Role Structure Under Sustained Workload',
    scenario: 'After three months of working in the same team on the same project, decision fatigue is rising and small mistakes are increasing. How are roles most clearly structured within your team?',
    scale: { minLabel: 'Very Low Skill Differentiation', maxLabel: 'High Skill Differentiation' },
    options: [
      {
        code: 'A',
        label: 'High Skill Differentiation',
        score: 5,
        text: 'Each member has clearly defined specialist responsibilities and rarely operates outside them.',
        interpretation: 'Specialist ownership is clear, which improves depth but raises dependency on key experts under fatigue.',
      },
      {
        code: 'B',
        label: 'Moderate to High Skill Differentiation',
        score: 4,
        text: 'Members have specialist areas but can cover each other when required.',
        interpretation: 'Specialist coverage is strong, which supports resilience but still needs clear handover discipline.',
      },
      {
        code: 'C',
        label: 'Moderate Skill Differentiation',
        score: 3,
        text: 'Roles exist but overlap frequently and flexibility is expected.',
        interpretation: 'Roles overlap, which builds flexibility but can blur accountability when tired.',
      },
      {
        code: 'D',
        label: 'Low Skill Differentiation',
        score: 2,
        text: 'Most members operate as generalists and rotate responsibilities fluidly.',
        interpretation: 'Generalist coverage spreads load, which aids redundancy but risks inconsistent quality under strain.',
      },
      {
        code: 'E',
        label: 'Very Low Skill Differentiation',
        score: 1,
        text: 'Roles shift depending on daily demand rather than predefined expertise.',
        interpretation: 'Roles shift daily, which allows adaptation but erodes clarity as fatigue builds.',
      },
    ],
  },
  temporal: {
    key: 'temporal',
    title: 'Structure Over Time',
    scenario: 'After months of working together under sustained pressure, emotional and cognitive fatigue are evident. How does the structure of authority and influence evolve over time?',
    scale: { minLabel: 'Low Stability', maxLabel: 'High Stability' },
    options: [
      {
        code: 'A',
        label: 'High Stability',
        score: 5,
        text: 'Roles and authority remain stable despite fatigue.',
        interpretation: 'Roles stay stable, which protects predictability but can resist needed shifts under pressure.',
      },
      {
        code: 'B',
        label: 'Moderately Stable',
        score: 4,
        text: 'Structure is mostly stable but adjusts deliberately when required.',
        interpretation: 'Structure is steady with deliberate adjustment, which supports control and responsiveness.',
      },
      {
        code: 'C',
        label: 'Adaptive Emergence',
        score: 3,
        text: 'Influence shifts subtly as some individuals prove more reliable.',
        interpretation: 'Influence shifts with reliability, which rewards performance but can unsettle cohesion.',
      },
      {
        code: 'D',
        label: 'Increasing Consolidation',
        score: 2,
        text: 'Authority gradually consolidates around a small group.',
        interpretation: 'Authority consolidates gradually, which reduces noise but can marginalise quieter voices.',
      },
      {
        code: 'E',
        label: 'Low Stability',
        score: 1,
        text: 'Structure becomes less clear as fatigue increases.',
        interpretation: 'Structure becomes unclear, which raises anxiety and slows coordinated action.',
      },
    ],
  },
};

const structuralAuthorityLinkPhrases = {
  'Concentrated Authority': 'may maintain decisive control but risk suppressed dissent under fatigue.',
  'Role-Based Authority': 'may thrive on expertise freedom but must guard against coordination gaps under fatigue.',
  'Shared Authority': 'may preserve cohesion but must guard against slow decisions under fatigue.',
  'Informal Authority': 'may enable rapid initiative but must guard against ambiguity and conflict under fatigue.',
  'Conditional Authority': 'may balance participation and escalation but must guard against decision lag under fatigue.',
};

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const templateByArchetype = {
  Anchor: {
    role: 'Stability lead',
    triggers: 'Sudden change without context',
    comms: 'Clear structure and calm tempo',
    best: 'Steady presence that keeps standards high',
    drift: 'Becomes rigid and risk averse under strain',
  },
  Connector: {
    role: 'Culture integrator',
    triggers: 'Isolation and low trust climates',
    comms: 'Warm, inclusive, and relational framing',
    best: 'Creates cohesion and shared purpose quickly',
    drift: 'Overextends to keep everyone aligned',
  },
  Navigator: {
    role: 'Strategic guide',
    triggers: 'Ambiguous goals and weak direction',
    comms: 'Concise options and directional cues',
    best: 'Maps the route and sets confident pace',
    drift: 'Overcontrols when pressure spikes',
  },
  Guardian: {
    role: 'Risk guardian',
    triggers: 'Loose processes and overlooked detail',
    comms: 'Evidence based, step by step clarity',
    best: 'Protects quality and manages hazards',
    drift: 'Hesitates when speed is required',
  },
  Explorer: {
    role: 'Discovery driver',
    triggers: 'Rigid constraints and closed thinking',
    comms: 'Curious, future focused, exploratory prompts',
    best: 'Finds new routes and lifts ambition',
    drift: 'Scatters focus and misses execution',
  },
  Energiser: {
    role: 'Momentum builder',
    triggers: 'Low energy and passive delivery',
    comms: 'Short bursts of direction and encouragement',
    best: 'Raises energy and drives urgency',
    drift: 'Pushes too hard when tired',
  },
  Synchroniser: {
    role: 'Rhythm setter',
    triggers: 'Disjointed timing and mixed cadence',
    comms: 'Timing cues and tempo alignment',
    best: 'Aligns movement and keeps collective flow',
    drift: 'Focuses on timing at the expense of risk',
  },
  'Decision-Maker': {
    role: 'Decisive lead',
    triggers: 'Slow debate and circular discussion',
    comms: 'Direct asks and time boxed choices',
    best: 'Commits quickly and clarifies accountability',
    drift: 'Becomes blunt or impatient under load',
  },
  Innovator: {
    role: 'Performance innovator',
    triggers: 'Stagnation and routine without purpose',
    comms: 'Bold, creative, outcome driven framing',
    best: 'Introduces new angles that lift standards',
    drift: 'Disrupts stability when fatigued',
  },
};

state.templates = templateByArchetype;

const ensureResults = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
};

const ensureStructuralProfile = () => {
  const raw = localStorage.getItem(STRUCTURAL_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.code) return null;
    if (!parsed.authority || !parsed.skill || !parsed.temporal) return null;
    if (typeof parsed.authority.score !== 'number' || typeof parsed.skill.score !== 'number' || typeof parsed.temporal.score !== 'number') {
      return null;
    }
    return parsed;
  } catch (err) {
    return null;
  }
};

const saveStructuralProfile = (payload) => {
  localStorage.setItem(STRUCTURAL_KEY, JSON.stringify(payload));
};

const clearStructuralProfile = () => {
  localStorage.removeItem(STRUCTURAL_KEY);
  state.structural = null;
};

const setActiveTab = (tab) => {
  elements.sections.forEach((section) => {
    section.classList.toggle('active', section.id === tab);
  });
  elements.navLinks.forEach((link) => {
    link.classList.toggle('active', link.dataset.tab === tab);
  });
};

const updateBadge = () => {
  const results = ensureResults();
  elements.completedBadge.style.display = results ? 'inline-flex' : 'none';
};

const renderAssessment = () => {
  elements.assessment.innerHTML = '';
  
  const card = document.createElement('div');
  card.className = 'question-card';
  card.innerHTML = `
    <h3>Pick your preferences</h3>
    <div class="option-grid" data-question="0"></div>
  `;
  const grid = card.querySelector('.option-grid');
  state.archetypes.forEach((arch) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.dataset.option = arch.name;
    btn.dataset.question = '0';
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = `
      <span><strong>${arch.id}.</strong> ${arch.preference}</span>
    `;
    btn.addEventListener('click', handleOptionClick);
    btn.addEventListener('keydown', handleOptionKeyDown);
    grid.appendChild(btn);
  });
  elements.assessment.appendChild(card);
  refreshAssessmentUI();
};

const renderTransitionCard = () => {
  if (!elements.structuralFlow) return;
  elements.assessment.hidden = true;
  elements.lockInWrap.hidden = true;
  elements.structuralFlow.innerHTML = `
    <div class="structural-shell">
      <div class="structural-intro">
        <h3>Explorers and Leaders Only</h3>
        <p>If you operate in extreme environments or lead under sustained pressure, continue to complete the structural diagnostic.</p>
        <div class="structural-actions">
          <button class="btn primary" id="structuralContinueBtn">Continue to Structural Profile</button>
          <button class="btn ghost" id="structuralSkipBtn">Skip and view results</button>
        </div>
      </div>
    </div>
  `;
  const continueBtn = document.getElementById('structuralContinueBtn');
  const skipBtn = document.getElementById('structuralSkipBtn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      renderStructuralDiagnostic();
    });
  }
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      window.location.hash = '#results';
      renderResults();
    });
  }
};

const structuralScoreToPercent = (score) => ((Math.max(1, Math.min(5, score)) - 1) / 4) * 100;

const getStructuralOption = (dimensionKey, code) => {
  const dimension = structuralDiagnosticModel[dimensionKey];
  if (!dimension) return null;
  return dimension.options.find((opt) => opt.code === code) || null;
};

const buildStructuralLinkSentence = (primaryArchetype, authorityLabel) => {
  if (!primaryArchetype || !authorityLabel) return '';
  const article = /^[AEIOU]/i.test(primaryArchetype) ? 'An' : 'A';
  const phrase = structuralAuthorityLinkPhrases[authorityLabel] || 'should balance decisive action with coordination discipline under fatigue.';
  return `${article} ${primaryArchetype} within a ${authorityLabel} structure ${phrase}`;
};

const renderStructuralOutput = (payload) => {
  const output = document.getElementById('structuralOutput');
  if (!output) return;
  const authority = payload?.authority || null;
  const skill = payload?.skill || null;
  const temporal = payload?.temporal || null;
  const primary = (state.results && state.results.primaryArchetype) || (ensureResults() || {}).primaryArchetype;
  const linkSentence = authority ? buildStructuralLinkSentence(primary, authority.label) : '';
  const authorityValue = authority ? structuralScoreToPercent(authority.score) : 0;
  const skillValue = skill ? structuralScoreToPercent(skill.score) : 0;
  const temporalValue = temporal ? structuralScoreToPercent(temporal.score) : 0;

  output.innerHTML = `
    <div class="structural-thermo-grid structural-thermo-results">
      <div class="structural-thermo">
        <div class="structural-thermo-title">Authority Differentiation</div>
        <div class="structural-thermo-meter">
          <div class="structural-thermo-track" data-value="${authorityValue}">
            <div class="structural-thermo-fill"></div>
          </div>
          <div class="structural-thermo-scale">
            <span>${structuralDiagnosticModel.authority.scale.maxLabel}</span>
            <span>${structuralDiagnosticModel.authority.scale.minLabel}</span>
          </div>
        </div>
        <div class="structural-state">${authority ? authority.label : 'Select an option to reveal the state.'}</div>
        <p class="structural-interpretation">${authority ? authority.interpretation : ''}</p>
      </div>
      <div class="structural-thermo">
        <div class="structural-thermo-title">Skill Differentiation</div>
        <div class="structural-thermo-meter">
          <div class="structural-thermo-track" data-value="${skillValue}">
            <div class="structural-thermo-fill"></div>
          </div>
          <div class="structural-thermo-scale">
            <span>${structuralDiagnosticModel.skill.scale.maxLabel}</span>
            <span>${structuralDiagnosticModel.skill.scale.minLabel}</span>
          </div>
        </div>
        <div class="structural-state">${skill ? skill.label : 'Select an option to reveal the state.'}</div>
        <p class="structural-interpretation">${skill ? skill.interpretation : ''}</p>
      </div>
      <div class="structural-thermo">
        <div class="structural-thermo-title">Temporal Stability</div>
        <div class="structural-thermo-meter">
          <div class="structural-thermo-track" data-value="${temporalValue}">
            <div class="structural-thermo-fill"></div>
          </div>
          <div class="structural-thermo-scale">
            <span>${structuralDiagnosticModel.temporal.scale.maxLabel}</span>
            <span>${structuralDiagnosticModel.temporal.scale.minLabel}</span>
          </div>
        </div>
        <div class="structural-state">${temporal ? temporal.label : 'Select an option to reveal the state.'}</div>
        <p class="structural-interpretation">${temporal ? temporal.interpretation : ''}</p>
      </div>
    </div>
    <p class="structural-explain">Authority Differentiation determines clarity and speed of decision rights. Skill Differentiation determines adaptability versus redundancy. Temporal Stability determines psychological predictability under sustained pressure.</p>
    ${linkSentence ? `<p class="structural-link">${linkSentence}</p>` : ''}
  `;

  output.querySelectorAll('.structural-thermo-track').forEach((track) => {
    const value = Number(track.dataset.value) || 0;
    const fill = track.querySelector('.structural-thermo-fill');
    if (!fill) return;
    setTimeout(() => {
      fill.style.height = `${Math.max(0, Math.min(100, value))}%`;
    }, 120);
  });
};

const renderStructuralDiagnostic = () => {
  if (!elements.structuralFlow) return;
  const existing = ensureStructuralProfile();
  const selections = {
    authority: existing?.authority?.code || null,
    skill: existing?.skill?.code || null,
    temporal: existing?.temporal?.code || null,
  };

  const buildQuestionBlock = (dimensionKey) => {
    const dimension = structuralDiagnosticModel[dimensionKey];
    if (!dimension) return '';
    const groupName = `structural-${dimensionKey}`;
    return `
      <div class="structural-question-block">
        <h4>${dimension.title}</h4>
        <p class="structural-scenario">${dimension.scenario}</p>
        <div class="structural-question" role="radiogroup" aria-label="${dimension.title}">
          ${dimension.options.map((opt) => `
            <label class="structural-option">
              <input type="radio" name="${groupName}" value="${opt.code}" ${selections[dimensionKey] === opt.code ? 'checked' : ''} />
              <span>${opt.code}. ${opt.text}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  };

  elements.structuralFlow.innerHTML = `
    <div class="structural-shell">
      <div class="structural-intro">
        <p class="structural-eyebrow">Structural Configuration Under Sustained Pressure</p>
        <h3>Structural Configuration Under Sustained Pressure</h3>
        <p>Teams are not only defined by personality. They are defined by structure.</p>
        <p>Research in extreme and high risk environments shows that team effectiveness under sustained pressure can be understood across three structural dimensions:</p>
        <div class="structural-dimension-list">
          <span>Authority Differentiation</span>
          <span>Skill Differentiation</span>
          <span>Temporal Stability</span>
        </div>
        <p>This diagnostic examines how your team most naturally organises itself when fatigue rises and cognitive load increases.</p>
      </div>
      <div class="structural-questions">
        ${buildQuestionBlock('authority')}
        ${buildQuestionBlock('skill')}
        ${buildQuestionBlock('temporal')}
      </div>
      <div id="structuralOutput"></div>
      <div class="structural-actions">
        <button class="btn primary" id="structuralFinishBtn" disabled>Finish</button>
      </div>
    </div>
  `;

  const updateStructuralState = () => {
    const nextSelections = {
      authority: elements.structuralFlow.querySelector('input[name="structural-authority"]:checked')?.value || null,
      skill: elements.structuralFlow.querySelector('input[name="structural-skill"]:checked')?.value || null,
      temporal: elements.structuralFlow.querySelector('input[name="structural-temporal"]:checked')?.value || null,
    };

    const authorityOption = nextSelections.authority ? getStructuralOption('authority', nextSelections.authority) : null;
    const skillOption = nextSelections.skill ? getStructuralOption('skill', nextSelections.skill) : null;
    const temporalOption = nextSelections.temporal ? getStructuralOption('temporal', nextSelections.temporal) : null;

    const payload = {
      authority: authorityOption ? {
        code: authorityOption.code,
        label: authorityOption.label,
        score: authorityOption.score,
        interpretation: authorityOption.interpretation,
      } : null,
      skill: skillOption ? {
        code: skillOption.code,
        label: skillOption.label,
        score: skillOption.score,
        interpretation: skillOption.interpretation,
      } : null,
      temporal: temporalOption ? {
        code: temporalOption.code,
        label: temporalOption.label,
        score: temporalOption.score,
        interpretation: temporalOption.interpretation,
      } : null,
    };

    renderStructuralOutput(payload);

    if (payload.authority || payload.skill || payload.temporal) {
      saveStructuralProfile(payload);
      state.structural = payload;
    }

    const finishBtn = document.getElementById('structuralFinishBtn');
    if (finishBtn) {
      finishBtn.disabled = !(payload.authority && payload.skill && payload.temporal);
    }
  };

  updateStructuralState();
  elements.structuralFlow.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.addEventListener('change', updateStructuralState);
  });

  const finishBtn = document.getElementById('structuralFinishBtn');
  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      window.location.hash = '#results';
      renderResults();
    });
  }
};

const handleOptionKeyDown = (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    event.currentTarget.click();
  }
};

const handleOptionClick = (event) => {
  const btn = event.currentTarget;
  const option = btn.dataset.option;
  const selection = state.selections;

  // If clicking on primary, deselect it
  if (selection.primary === option) {
    selection.primary = null;
  }
  // If clicking on secondary, deselect it
  else if (selection.secondary === option) {
    selection.secondary = null;
  }
  // If no primary selected yet, set it
  else if (!selection.primary) {
    selection.primary = option;
  }
  // If primary exists but no secondary, set secondary
  else if (!selection.secondary) {
    selection.secondary = option;
  }
  // If both exist, trigger reset flash and require reset
  else {
    // Flash the reset button
    if (elements.resetBtn) {
      elements.resetBtn.classList.add('urgent-flash');
      setTimeout(() => elements.resetBtn.classList.remove('urgent-flash'), 800);
    }
    return; // Don't update selection
  }

  state.recency[option] = Date.now();
  refreshAssessmentUI();
  updateLockInState();
};

const refreshAssessmentUI = () => {
  document.querySelectorAll('.option-btn').forEach((btn) => {
    const option = btn.dataset.option;
    const selection = state.selections;
    btn.classList.remove('selected', 'primary-flash', 'secondary-flash');
    btn.setAttribute('aria-pressed', 'false');
    btn.dataset.badge = '';
    
    if (selection.primary === option) {
      btn.classList.add('selected', 'primary-flash');
      btn.setAttribute('aria-pressed', 'true');
      btn.dataset.badge = 'PRIMARY';
    }
    if (selection.secondary === option) {
      btn.classList.add('selected', 'secondary-flash');
      btn.setAttribute('aria-pressed', 'true');
      btn.dataset.badge = 'SECONDARY';
    }
  });
};

const updateLockInState = () => {
  const allComplete = state.selections.primary && state.selections.secondary;
  elements.lockInWrap.hidden = !allComplete;
  if (allComplete) {
    elements.lockInBtn.classList.add('pulse-urgent');
  } else {
    elements.lockInBtn.classList.remove('pulse-urgent');
  }
};

const scoreSelections = () => {
  const primary = state.selections.primary;
  const secondary = state.selections.secondary;
  return {
    primaryArchetype: primary,
    secondaryArchetype: secondary,
  };
};

const saveResults = (payload) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  updateBadge();
};

const handleLockIn = () => {
  const scoring = scoreSelections();
  const payload = {
    completedAt: new Date().toISOString(),
    primaryArchetype: scoring.primaryArchetype,
    secondaryArchetype: scoring.secondaryArchetype,
    breakdown: scoring,
  };
  saveResults(payload);
  state.results = payload;
  renderTransitionCard();
};

const handleResetPreferences = () => {
  state.selections = { primary: null, secondary: null };
  state.recency = {};
  clearStructuralProfile();
  if (elements.structuralFlow) {
    elements.structuralFlow.innerHTML = '';
  }
  elements.assessment.hidden = false;
  refreshAssessmentUI();
  updateLockInState();
};

const clearResults = () => {
  localStorage.removeItem(STORAGE_KEY);
  clearStructuralProfile();
  state.results = null;
  state.selections = { primary: null, secondary: null };
  state.recency = {};
  renderAssessment();
  updateBadge();
};

const clampScore = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 5;
  return Math.min(9, Math.max(1, num));
};

const scoreToPercent = (score) => ((clampScore(score) - 1) / 8) * 100;

const scoreToAngle = (score) => -90 + ((clampScore(score) - 1) / 8) * 180;

const getPrefs = (archetype) => state.goalRiskPaceMap[archetype] || null;

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const riskColour = (score) => {
  const val = clampScore(score);
  if (val <= 3) return '#2aa6a1';
  if (val <= 6) return '#f0b429';
  return '#e34d59';
};

const buildExploreNarrative = (score, archetypeName) => {
  const val = clampScore(score);
  if (val >= 7) {
    return `${archetypeName} sits high on exploration, so you are most effective when you keep options alive and test ideas quickly. Under fatigue or executive load you may narrow into safe, familiar choices and drift toward exploit. To rebalance, set a short exploration window, name one hypothesis, then commit to a controlled test.`;
  }
  if (val <= 3) {
    return `${archetypeName} is exploit dominant, so you perform best with clear targets, focused attention, and efficient execution. Under pressure you can tighten further and over-index on proven moves. To rebalance, open a small exploration block, invite a second option, and run a brief test before locking in.`;
  }
  return `${archetypeName} sits near the middle of the explore and exploit range, which helps you switch modes when the moment demands it. Under pressure you may default to exploit for certainty. To rebalance, make space for one new option and confirm which parts of the plan can flex.`;
};

const buildPaceNarrative = (score, archetypeName) => {
  const val = clampScore(score);
  if (val >= 7) {
    return `${archetypeName} is pace dominant, so you move quickly, iterate fast, and keep decisions flowing. Under stress you can rush and lose detail. To rebalance, slow the next step, confirm standards, and use one deliberate checkpoint before pushing pace again.`;
  }
  if (val <= 3) {
    return `${archetypeName} is precision dominant, so you refine, control, and protect quality under pressure. Under stress you can stall while tightening detail. To rebalance, time-box refinement, define minimum viable quality, and commit to the next action.`;
  }
  return `${archetypeName} balances pace and precision, which helps you adjust speed without losing standards. Under stress you may tilt toward pace for progress or precision for safety. To rebalance, agree a clear tempo and lock the quality threshold early.`;
};

const buildRiskNarrative = (score, archetypeName) => {
  const val = clampScore(score);
  if (val >= 7) {
    return `${archetypeName} carries high risk tolerance, so you can move decisively when stakes are elevated. Under time pressure this can rise further, which may create avoidable exposure.`;
  }
  if (val <= 3) {
    return `${archetypeName} carries low risk tolerance, so you protect quality and safety before committing. Under time pressure this can tighten and slow action.`;
  }
  return `${archetypeName} holds a moderate risk profile, so you can take calculated action without losing control. Under time or social pressure you may oscillate between caution and push.`;
};

const buildRiskAdjustment = (score) => {
  const val = clampScore(score);
  if (val >= 7) {
    return 'Agree one non-negotiable control before the next bold move.';
  }
  if (val <= 3) {
    return 'Separate non-negotiables from preferences and create a safe route to progress.';
  }
  return 'Define the decision rule in advance, then act once the rule is met.';
};

const explainRiskPressure = (score) => {
  const val = clampScore(score);
  if (val >= 7) {
    return {
      time: 'Time pressure can increase risk appetite and accelerate decisions.',
      social: 'Social pressure can push bolder choices to protect momentum or status.',
      cognitive: 'Cognitive overload can reduce planning and increase impulsive action.',
    };
  }
  if (val <= 3) {
    return {
      time: 'Time pressure can reduce tolerance and favour safer, simpler choices.',
      social: 'Social pressure can heighten caution and reduce experimental moves.',
      cognitive: 'Cognitive overload can narrow choices to the safest known option.',
    };
  }
  return {
    time: 'Time pressure can tilt decisions toward whichever option feels most familiar.',
    social: 'Social pressure can increase caution or drive a bold move depending on trust.',
    cognitive: 'Cognitive overload can reduce nuanced assessment of risk and reward.',
  };
};

const initMetricObserver = (root) => {
  if (!root) return;
  const targets = root.querySelectorAll('.animate-on-view');
  if (!targets.length) return;
  if (!('IntersectionObserver' in window)) {
    targets.forEach((target) => {
      if (target.dataset.animated === 'true') return;
      target.dataset.animated = 'true';
      animateMetric(target);
    });
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.dataset.animated === 'true') return;
      el.dataset.animated = 'true';
      animateMetric(el);
      obs.unobserve(el);
    });
  }, { threshold: 0.35 });
  targets.forEach((target) => observer.observe(target));
};

const animateMetric = (el) => {
  const type = el.dataset.type;
  if (type === 'continuum') {
    const value = scoreToPercent(el.dataset.value);
    el.style.setProperty('--marker', `${value}%`);
    el.classList.add('is-animated');
  }
  if (type === 'dial') {
    const angle = scoreToAngle(el.dataset.value);
    el.style.setProperty('--needle', `${angle}deg`);
    el.classList.add('is-animated');
  }
  if (type === 'ring') {
    const value = clampScore(el.dataset.value);
    const progress = el.querySelector('.ring-progress');
    const label = el.querySelector('.ring-value');
    if (progress) {
      const radius = Number(progress.getAttribute('r')) || 48;
      const circumference = 2 * Math.PI * radius;
      progress.style.strokeDasharray = `${circumference}`;
      progress.style.strokeDashoffset = `${circumference}`;
      const offset = circumference * (1 - value / 9);
      setTimeout(() => {
        progress.style.strokeDashoffset = `${offset}`;
      }, 120);
    }
    if (label) {
      label.textContent = `${value}/9`;
    }
    if (el.dataset.color === 'risk' && progress) {
      progress.style.stroke = riskColour(value);
    }
    el.classList.add('is-animated');
  }
  if (type === 'thermometer') {
    const value = clampScore(el.dataset.value);
    const fill = el.querySelector('.thermo-fill');
    const arrow = el.querySelector('.thermo-arrow');
    if (fill) {
      const percent = scoreToPercent(value);
      setTimeout(() => {
        fill.style.height = `${percent}%`;
        if (arrow) {
          arrow.style.bottom = `calc(${percent}% - 6px)`;
        }
      }, 120);
    }
    el.classList.add('is-animated');
  }
};

const renderResults = () => {
  const data = ensureResults();
  elements.resultsContent.innerHTML = '';
  if (!data) {
    elements.resultsContent.innerHTML = `
      <div class="notice">
        <p>No results saved yet. Start the assessment to see your archetype pair.</p>
        <a class="btn primary" href="#start">Start now</a>
      </div>
    `;
    return;
  }
  const primary = state.archetypeMap[data.primaryArchetype];
  const secondary = state.archetypeMap[data.secondaryArchetype];
  if (!primary || !secondary) {
    elements.resultsContent.innerHTML = `
      <div class="notice">
        <p>Results are saved but archetype data is missing. Refresh once data is available.</p>
      </div>
    `;
    return;
  }

  const synergyMatch = primary.synergyPartner === secondary.archetype;
  const prefs = getPrefs(primary.archetype);
  const exploreScore = prefs ? prefs.exploreExploit : 5;
  const paceScore = prefs ? prefs.pacePrecision : 5;
  const riskScore = prefs ? prefs.riskTolerance : 5;
  const exploreNarrative = buildExploreNarrative(exploreScore, primary.archetype);
  const paceNarrative = buildPaceNarrative(paceScore, primary.archetype);
  const riskNarrative = buildRiskNarrative(riskScore, primary.archetype);
  const riskAdjustment = buildRiskAdjustment(riskScore);
  const riskPressure = explainRiskPressure(riskScore);
  const leadershipCopy = performanceLeadershipCopy[primary.archetype] || 'Your leadership profile blends best self behaviours, direct communication strengths, and a clear standard for the team.';
  const structural = ensureStructuralProfile();
  const structuralReady = structural && structural.authority && structural.skill && structural.temporal;
  const structuralLink = structuralReady
    ? buildStructuralLinkSentence(primary.archetype, structural.authority.label)
    : '';
  const structuralAuthorityPercent = structuralReady ? structuralScoreToPercent(structural.authority.score) : 0;
  const structuralSkillPercent = structuralReady ? structuralScoreToPercent(structural.skill.score) : 0;
  const structuralTemporalPercent = structuralReady ? structuralScoreToPercent(structural.temporal.score) : 0;

  elements.resultsContent.innerHTML = `
    <div style="margin-bottom: 32px;">
      <div id="archetypeWheel" style="max-width: 480px; margin: 0 auto;"></div>
    </div>
    <div class="results-grid">
      <div class="card">
        <h3>Your primary archetype</h3>
        <h2 style="color: #ff6b35;">${primary.archetype}</h2>
        <p>${primary.descriptor}</p>
        <div class="kv"><strong>Best self behaviours</strong><p>${primary.bestSelf}</p></div>
        <div class="kv"><strong>Under pressure drift</strong><p>${primary.drift}</p></div>
        <div class="kv"><strong>Triggers</strong><p>${primary.triggers}</p></div>
        <div class="kv"><strong>Communication preferences</strong><p>${primary.communication}</p></div>
        <div class="kv"><strong>Growth edge</strong><p>${primary.growthEdge}</p></div>
      </div>
      <div class="card secondary">
        <h3>Your secondary archetype</h3>
        <h2 style="color: #ff6b35;">${secondary.archetype}</h2>
        <p>${secondary.descriptor}</p>
        <div class="kv"><strong>Best self behaviours</strong><p>${secondary.bestSelf}</p></div>
        <div class="kv"><strong>Under pressure drift</strong><p>${secondary.drift}</p></div>
        <div class="kv"><strong>Triggers</strong><p>${secondary.triggers}</p></div>
        <div class="kv"><strong>Communication preferences</strong><p>${secondary.communication}</p></div>
        <div class="kv"><strong>Growth edge</strong><p>${secondary.growthEdge}</p></div>
      </div>
    </div>
    <div class="card" style="margin-top:24px;">
      <h3 class="metric-heading">Goals</h3>
      <div class="metric-card animate-on-view" data-type="continuum" data-value="${exploreScore}">
        <div class="metric-header">
          <span class="metric-title">Exploit ↔ Explore</span>
          <span class="metric-score">${exploreScore}/9</span>
        </div>
        <div class="goals-spectrum">
          <div class="goals-track">
            <span class="goals-marker"></span>
          </div>
          <div class="goals-labels">
            <div>
              <strong>Exploit goals</strong>
              <span>Structured, precise, defined outcomes, low ambiguity.</span>
            </div>
            <div>
              <strong>Exploratory goals</strong>
              <span>Adaptive, creative, open framed, hypothesis driven.</span>
            </div>
          </div>
        </div>
      </div>
      <p class="metric-explain">Exploratory goals require cognitive flexibility, working memory, and imagination. Exploit goals favour focus, efficiency, and narrowing attention. Fatigue and executive load push people toward exploit behaviour. Cognitive bandwidth enables exploration.</p>
      <p class="metric-insight">${exploreNarrative}</p>
    </div>
    <div class="card" style="margin-top:24px;">
      <h3 class="metric-heading">Speed of Decisions</h3>
      <div class="metric-card animate-on-view" data-type="dial" data-value="${paceScore}">
        <div class="metric-header">
          <span class="metric-title">Precision ↔ Pace</span>
          <span class="metric-score">${paceScore}/9</span>
        </div>
        <div class="dial">
          <div class="dial-arc"></div>
          <div class="dial-needle"></div>
          <div class="dial-center"></div>
          <div class="dial-label left">Precision</div>
          <div class="dial-label right">Pace</div>
        </div>
      </div>
      <p class="metric-explain">Pace dominant individuals move quickly and iterate fast. Precision dominant individuals slow down, refine, and control. Both have strengths. Under stress, pace types can rush and precision types can stall.</p>
      <p class="metric-insight">${paceNarrative}</p>
    </div>
    <div class="card" style="margin-top:24px;">
      <h3 class="metric-heading">Risk</h3>
      <div class="metric-card animate-on-view" data-type="thermometer" data-value="${riskScore}">
        <div class="metric-header">
          <span class="metric-title">Risk tolerance</span>
          <span class="metric-score">${riskScore}/9</span>
        </div>
        <div class="thermo">
          <div class="thermo-meter">
            <div class="thermo-track-wrap">
              <div class="thermo-track">
                <div class="thermo-fill"></div>
                <div class="thermo-cap"></div>
                <div class="thermo-bulb"></div>
              </div>
              <div class="thermo-arrow" aria-hidden="true"></div>
            </div>
            <div class="thermo-scale">
              <span>High</span>
              <span>Low</span>
            </div>
          </div>
        </div>
      </div>
      <p class="metric-explain">Risk tolerance reflects how readily this archetype accepts uncertainty and exposure. ${riskNarrative}</p>
      <div class="metric-sublist">
        <p><strong>Time pressure:</strong> ${riskPressure.time}</p>
        <p><strong>Social pressure:</strong> ${riskPressure.social}</p>
        <p><strong>Cognitive overload:</strong> ${riskPressure.cognitive}</p>
      </div>
      <p class="metric-insight">Coaching adjustment: ${riskAdjustment}</p>
    </div>
    <div class="card" style="margin-top:24px;">
      <h3>Synergy</h3>
      <p><strong>Partner:</strong> ${primary.synergyPartner}</p>
      <p><strong>Meaning:</strong> ${primary.synergyMeaning}</p>
      <p>${synergyMatch ? 'This pairing is a natural synergy in your profile.' : 'This insight offers a complementary partnership to strengthen balance.'}</p>
    </div>
    <div class="card" style="margin-top:24px;">
      <h3>In Performance Leadership</h3>
      <p>${leadershipCopy}</p>
    </div>
    ${structuralReady ? `
    <div class="card" style="margin-top:24px;">
      <h3>Structural Configuration Under Sustained Pressure</h3>
      <div class="structural-thermo-grid structural-thermo-results">
        <div class="structural-thermo">
          <div class="structural-thermo-title">Authority Differentiation</div>
          <div class="structural-thermo-meter">
            <div class="structural-thermo-track" data-value="${structuralAuthorityPercent}">
              <div class="structural-thermo-fill"></div>
            </div>
            <div class="structural-thermo-scale">
              <span>${structuralDiagnosticModel.authority.scale.maxLabel}</span>
              <span>${structuralDiagnosticModel.authority.scale.minLabel}</span>
            </div>
          </div>
          <div class="structural-state">${structural.authority.label}</div>
          <p class="structural-interpretation">${structural.authority.interpretation}</p>
        </div>
        <div class="structural-thermo">
          <div class="structural-thermo-title">Skill Differentiation</div>
          <div class="structural-thermo-meter">
            <div class="structural-thermo-track" data-value="${structuralSkillPercent}">
              <div class="structural-thermo-fill"></div>
            </div>
            <div class="structural-thermo-scale">
              <span>${structuralDiagnosticModel.skill.scale.maxLabel}</span>
              <span>${structuralDiagnosticModel.skill.scale.minLabel}</span>
            </div>
          </div>
          <div class="structural-state">${structural.skill.label}</div>
          <p class="structural-interpretation">${structural.skill.interpretation}</p>
        </div>
        <div class="structural-thermo">
          <div class="structural-thermo-title">Temporal Stability</div>
          <div class="structural-thermo-meter">
            <div class="structural-thermo-track" data-value="${structuralTemporalPercent}">
              <div class="structural-thermo-fill"></div>
            </div>
            <div class="structural-thermo-scale">
              <span>${structuralDiagnosticModel.temporal.scale.maxLabel}</span>
              <span>${structuralDiagnosticModel.temporal.scale.minLabel}</span>
            </div>
          </div>
          <div class="structural-state">${structural.temporal.label}</div>
          <p class="structural-interpretation">${structural.temporal.interpretation}</p>
        </div>
      </div>
      <p class="structural-explain">Authority Differentiation determines clarity and speed of decision rights. Skill Differentiation determines adaptability versus redundancy. Temporal Stability determines psychological predictability under sustained pressure.</p>
      <div class="structural-summary">
        <div><strong>Authority Differentiation:</strong> ${structural.authority.label} (${structural.authority.score}/5)</div>
        <div><strong>Skill Differentiation:</strong> ${structural.skill.label} (${structural.skill.score}/5)</div>
        <div><strong>Temporal Stability:</strong> ${structural.temporal.label} (${structural.temporal.score}/5)</div>
      </div>
      ${structuralLink ? `<p class="structural-link">${structuralLink}</p>` : ''}
    </div>
    ` : ''}
    <div class="actions">
      <button class="btn ghost" id="retakeBtn">Retake test</button>
      <button class="btn primary" id="pdfBtn">Download PDF</button>
    </div>
  `;

  renderArchetypeWheel(data.primaryArchetype, data.secondaryArchetype);
  initMetricObserver(elements.resultsContent);
  elements.resultsContent.querySelectorAll('.structural-thermo-track').forEach((track) => {
    const value = Number(track.dataset.value) || 0;
    const fill = track.querySelector('.structural-thermo-fill');
    if (!fill) return;
    setTimeout(() => {
      fill.style.height = `${Math.max(0, Math.min(100, value))}%`;
    }, 120);
  });

  document.getElementById('retakeBtn').addEventListener('click', () => {
    clearResults();
    window.location.hash = '#start';
  });

  document.getElementById('pdfBtn').addEventListener('click', () => {
    downloadPDF(data.primaryArchetype, data.secondaryArchetype);
  });
};

const downloadPDF = (primaryName, secondaryName) => {
  const primary = state.archetypeMap[primaryName];
  const secondary = state.archetypeMap[secondaryName];
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>Archetypes Assessment Results</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #111; margin: 40px; }
        h1 { font-size: 28px; margin-bottom: 10px; }
        h2 { font-size: 20px; margin-top: 20px; margin-bottom: 12px; border-bottom: 2px solid #111; padding-bottom: 8px; }
        .archetype-card { margin-bottom: 30px; page-break-inside: avoid; }
        .section { margin-bottom: 20px; }
        .section strong { display: block; margin-bottom: 6px; margin-top: 12px; }
        p { margin: 8px 0; }
        .primary { background: #f0f0f0; padding: 20px; margin-bottom: 20px; }
        .secondary { background: #fafafa; padding: 20px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>Your Archetypes Assessment</h1>
      <p style="color: #666; margin-bottom: 20px;">Completed on ${new Date().toLocaleDateString()}</p>
      
      <div class="primary">
        <h2>${primary.archetype} (Primary)</h2>
        <p><strong>Descriptor:</strong> ${primary.descriptor}</p>
        <div class="section">
          <strong>Best Self Behaviours:</strong>
          <p>${primary.bestSelf}</p>
        </div>
        <div class="section">
          <strong>Under Pressure Drift:</strong>
          <p>${primary.drift}</p>
        </div>
        <div class="section">
          <strong>Triggers:</strong>
          <p>${primary.triggers}</p>
        </div>
        <div class="section">
          <strong>Communication Preferences:</strong>
          <p>${primary.communication}</p>
        </div>
        <div class="section">
          <strong>Growth Edge:</strong>
          <p>${primary.growthEdge}</p>
        </div>
      </div>
      
      <div class="secondary">
        <h2>${secondary.archetype} (Secondary)</h2>
        <p><strong>Descriptor:</strong> ${secondary.descriptor}</p>
        <div class="section">
          <strong>Best Self Behaviours:</strong>
          <p>${secondary.bestSelf}</p>
        </div>
        <div class="section">
          <strong>Under Pressure Drift:</strong>
          <p>${secondary.drift}</p>
        </div>
        <div class="section">
          <strong>Triggers:</strong>
          <p>${secondary.triggers}</p>
        </div>
        <div class="section">
          <strong>Communication Preferences:</strong>
          <p>${secondary.communication}</p>
        </div>
        <div class="section">
          <strong>Growth Edge:</strong>
          <p>${secondary.growthEdge}</p>
        </div>
      </div>
      
      <div>
        <h2>Synergy</h2>
        <p><strong>Partner:</strong> ${primary.synergyPartner}</p>
        <p><strong>Meaning:</strong> ${primary.synergyMeaning}</p>
      </div>
    </body>
    </html>
  `;
  
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Archetypes_${primaryName}_${secondaryName}_${new Date().getTime()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const downloadTeamPDF = (rows) => {
  if (!rows || !rows.length) return;

  const primaryCounts = {};
  rows.forEach((row) => {
    primaryCounts[row.primary] = (primaryCounts[row.primary] || 0) + 1;
  });
  const sorted = Object.entries(primaryCounts).sort((a, b) => b[1] - a[1]);
  const topTwo = sorted.slice(0, 2).map((item) => item[0]);
  const missing = state.archetypes.map((a) => a.name).filter((name) => !primaryCounts[name]);

  const profileRows = rows
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((person) => {
      const pref = getPrefs(person.primary) || {};
      return `
        <tr>
          <td>${escapeHtml(person.name)}</td>
          <td>${escapeHtml(person.role || 'Player')}</td>
          <td>${escapeHtml(person.primary)}</td>
          <td>${escapeHtml(person.secondary || 'Not set')}</td>
          <td>${escapeHtml(pref.goalComms || 'Not set')}</td>
          <td>${escapeHtml(pref.feedbackStyle || 'Not set')}</td>
        </tr>
      `;
    }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>Team Archetypes Report</title>
      <style>
        @page { margin: 20mm; }
        body { font-family: Arial, sans-serif; line-height: 1.45; color: #111; }
        h1 { margin: 0 0 8px; font-size: 28px; }
        h2 { margin: 20px 0 8px; font-size: 18px; }
        p { margin: 6px 0; }
        .meta { color: #5e5e5e; margin-bottom: 14px; }
        .panel { border: 1px solid #e6e6e6; border-radius: 10px; padding: 14px; margin: 14px 0; }
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
        th, td { border: 1px solid #dcdcdc; padding: 8px; vertical-align: top; text-align: left; }
        th { background: #f7f7f7; }
      </style>
    </head>
    <body>
      <h1>Team Archetypes Report</h1>
      <p class="meta">Generated on ${new Date().toLocaleString()}</p>

      <div class="panel">
        <h2>Team Snapshot</h2>
        <div class="summary-grid">
          <p><strong>Total people:</strong> ${rows.length}</p>
          <p><strong>Most common archetypes:</strong> ${escapeHtml(topTwo.join(', ') || 'Not enough data')}</p>
          <p><strong>Least represented:</strong> ${escapeHtml(missing.length ? missing.join(', ') : 'None missing')}</p>
          <p><strong>Role split:</strong> ${escapeHtml(`Players ${rows.filter((r) => (r.role || 'Player') === 'Player').length}, Coaches ${rows.filter((r) => r.role === 'Coach').length}`)}</p>
        </div>
      </div>

      <div class="panel">
        <h2>Individuals Communication Overview</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Primary</th>
              <th>Secondary</th>
              <th>Goal Communication</th>
              <th>Feedback Style</th>
            </tr>
          </thead>
          <tbody>
            ${profileRows}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Team_Archetypes_Report_${new Date().getTime()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const renderArchetypeWheel = (primaryName, secondaryName) => {
  const wheelContainer = document.getElementById('archetypeWheel');
  if (!wheelContainer) return;
  
  const radius = 148;
  const centerX = 180;
  const centerY = 180;
  
  let svg = `
    <svg viewBox="-28 -28 416 416" style="width: 100%; height: auto; shape-rendering: geometricPrecision; text-rendering: geometricPrecision;">
      <defs>
        <style>
          @keyframes centerArchetypeCycle {
            0% { opacity: 1; }
            8% { opacity: 1; }
            11.111% { opacity: 0; }
            100% { opacity: 0; }
          }
          @keyframes morphShapeGlow {
            0% { opacity: 0.35; }
            50% { opacity: 0.65; }
            100% { opacity: 0.35; }
          }
          .scanner-archetype-name {
            opacity: 0;
            animation: centerArchetypeCycle 27s linear infinite;
            filter: drop-shadow(0 0 6px rgba(255, 107, 53, 0.75)) drop-shadow(0 0 14px rgba(255, 107, 53, 0.5));
            pointer-events: none;
          }
          .wheel-archetype {
            cursor: pointer;
            pointer-events: all;
          }
          .morph-core {
            animation: morphShapeGlow 6s ease-in-out infinite;
          }
        </style>
      </defs>
      <ellipse cx="${centerX}" cy="${centerY}" rx="146" ry="141" fill="none" stroke="#e6e6e6" stroke-width="1.3">
        <animate attributeName="rx" values="146;152;140;148;146" dur="10.5s" begin="-6.2s" repeatCount="indefinite" />
        <animate attributeName="ry" values="141;134;149;138;141" dur="10.5s" begin="-4.8s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="rotate" from="0 ${centerX} ${centerY}" to="360 ${centerX} ${centerY}" dur="20s" begin="-11s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="${centerX}" cy="${centerY}" rx="110" ry="105" fill="none" stroke="#e6e6e6" stroke-width="1.2" opacity="0.7">
        <animate attributeName="rx" values="110;116;102;112;110" dur="9.6s" begin="-5.5s" repeatCount="indefinite" />
        <animate attributeName="ry" values="105;98;114;101;105" dur="9.6s" begin="-3.7s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="rotate" from="360 ${centerX} ${centerY}" to="0 ${centerX} ${centerY}" dur="20s" begin="-13.5s" repeatCount="indefinite" />
      </ellipse>
      <polygon class="morph-core" fill="#7b7b7b" opacity="0.45"
        points="${centerX-22},${centerY} ${centerX-14},${centerY} ${centerX-7},${centerY} ${centerX},${centerY} ${centerX+7},${centerY} ${centerX+14},${centerY} ${centerX+22},${centerY} ${centerX},${centerY}">
        <animate attributeName="points" dur="14s" begin="-8.4s" repeatCount="indefinite"
          values="
            ${centerX},${centerY} ${centerX},${centerY} ${centerX},${centerY} ${centerX},${centerY} ${centerX},${centerY} ${centerX},${centerY} ${centerX},${centerY} ${centerX},${centerY};
            ${centerX-22},${centerY} ${centerX-14},${centerY} ${centerX-7},${centerY} ${centerX},${centerY} ${centerX+7},${centerY} ${centerX+14},${centerY} ${centerX+22},${centerY} ${centerX},${centerY};
            ${centerX},${centerY-20} ${centerX+17},${centerY+10} ${centerX+10},${centerY+13} ${centerX},${centerY+16} ${centerX-10},${centerY+13} ${centerX-17},${centerY+10} ${centerX-8},${centerY-4} ${centerX+8},${centerY-4};
            ${centerX},${centerY-20} ${centerX+20},${centerY-20} ${centerX+20},${centerY} ${centerX+20},${centerY+20} ${centerX},${centerY+20} ${centerX-20},${centerY+20} ${centerX-20},${centerY} ${centerX-20},${centerY-20};
            ${centerX},${centerY-22} ${centerX+17},${centerY-9} ${centerX+11},${centerY+16} ${centerX},${centerY+22} ${centerX-11},${centerY+16} ${centerX-17},${centerY-9} ${centerX-6},${centerY-19} ${centerX+6},${centerY-19};
            ${centerX},${centerY-22} ${centerX+18},${centerY-11} ${centerX+18},${centerY+11} ${centerX},${centerY+22} ${centerX-18},${centerY+11} ${centerX-18},${centerY-11} ${centerX-9},${centerY-19} ${centerX+9},${centerY-19};
            ${centerX},${centerY-22} ${centerX+17},${centerY-13} ${centerX+21},${centerY+4} ${centerX+10},${centerY+19} ${centerX-10},${centerY+19} ${centerX-21},${centerY+4} ${centerX-17},${centerY-13} ${centerX},${centerY-22};
            ${centerX},${centerY-22} ${centerX+16},${centerY-16} ${centerX+22},${centerY} ${centerX+16},${centerY+16} ${centerX},${centerY+22} ${centerX-16},${centerY+16} ${centerX-22},${centerY} ${centerX-16},${centerY-16};
            ${centerX},${centerY} ${centerX},${centerY} ${centerX},${centerY} ${centerX},${centerY} ${centerX},${centerY} ${centerX},${centerY} ${centerX},${centerY} ${centerX},${centerY}
          " />
        <animateTransform attributeName="transform" type="rotate" from="0 ${centerX} ${centerY}" to="360 ${centerX} ${centerY}" dur="18s" begin="-9.3s" repeatCount="indefinite" />
      </polygon>
      <g id="scanner-center">
  `;
  
  // Add archetype names to center scanner (same as home page)
  state.archetypes.forEach((arch, idx) => {
    svg += `
      <text class="scanner-archetype-name" x="${centerX}" y="${centerY}" text-anchor="middle" dominant-baseline="middle" font-weight="900" font-size="22" fill="#ff6b35" letter-spacing="1.2" style="text-transform: uppercase; animation-delay: ${idx * 3}s;">${arch.name}</text>
    `;
  });
  
  svg += `</g>`;
  
  // Add outer 9 archetypes without fly-in animation
  state.archetypes.forEach((arch, idx) => {
    const angle = (idx * 360 / state.archetypes.length - 90) * Math.PI / 180;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    const isPrimary = arch.name === primaryName;
    const isSecondary = arch.name === secondaryName;
    
    const textColor = isPrimary || isSecondary ? '#ff6b35' : '#111';
    
    if (arch.name === 'Decision-Maker') {
      svg += `
        <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-weight="700" font-size="11.5" fill="${textColor}" class="wheel-archetype" data-archetype="${arch.name}">
          <tspan x="${x}" dy="-0.45em">Decision-</tspan>
          <tspan x="${x}" dy="1.05em">Maker</tspan>
        </text>
      `;
    } else {
      svg += `
        <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-weight="700" font-size="12" fill="${textColor}" class="wheel-archetype" data-archetype="${arch.name}">${arch.name}</text>
      `;
    }
  });
  
  svg += `</svg>`;
  
  wheelContainer.innerHTML = `
    <div style="position: relative; width: 100%; max-width: 460px; margin: 0 auto;">
      ${svg}
      <div id="wheelArchetypeTooltip" style="margin-top: 12px; min-height: 82px; background: #f7f7f7; border: 1px solid #e6e6e6; border-radius: 10px; padding: 10px 12px; color: #303030; font-size: 0.88rem; line-height: 1.45;">
        <strong style="display: block; margin-bottom: 4px; color: #111;">Hover an archetype</strong>
        <span>Move over any outer wheel label to see a brief description.</span>
      </div>
    </div>
  `;

  const tooltip = wheelContainer.querySelector('#wheelArchetypeTooltip');
  const wheelLabels = wheelContainer.querySelectorAll('.wheel-archetype[data-archetype]');
  wheelLabels.forEach((label) => {
    const name = label.getAttribute('data-archetype');
    label.addEventListener('mouseenter', () => {
      const profile = state.archetypeMap[name] || {};
      const brief = profile.descriptor || 'Description unavailable.';
      tooltip.innerHTML = `
        <strong style="display: block; margin-bottom: 4px; color: #111;">${name}</strong>
        <span>${brief}</span>
      `;
    });
  });
};

const renderTeamGate = () => {
  const unlocked = sessionStorage.getItem(TEAM_UNLOCK_KEY) === 'true';
  if (unlocked) {
    elements.teamGate.innerHTML = '';
    elements.teamContent.hidden = false;
    renderTeamContent();
    return;
  }
  elements.teamContent.hidden = true;
  elements.teamGate.innerHTML = `
    <div class="card" style="max-width:420px;">
      <h3>Team access</h3>
      <p>Enter the password to unlock the team dashboard.</p>
      <div style="display:grid; gap:12px;">
        <input id="teamPassword" type="password" aria-label="Team password" placeholder="Password" />
        <button class="btn primary" id="teamUnlock">Unlock</button>
        <p class="hint" id="teamError" aria-live="polite"></p>
      </div>
    </div>
  `;
  document.getElementById('teamUnlock').addEventListener('click', () => {
    const val = document.getElementById('teamPassword').value;
    if (val === 'Purple') {
      sessionStorage.setItem(TEAM_UNLOCK_KEY, 'true');
      renderTeamGate();
    } else {
      document.getElementById('teamError').textContent = 'Incorrect password.';
    }
  });
};

const renderTeamContent = () => {
  elements.teamContent.innerHTML = `
    <div class="team-upload">
      <div>
        <h3>Upload team file</h3>
        <p>Use an .xlsx with headers: Name, Primary Archetype, Secondary Archetype.</p>
      </div>
      <input id="teamFile" type="file" accept=".xlsx" aria-label="Upload team file" />
      <div id="teamErrors" class="hint" aria-live="polite"></div>
    </div>
    <div class="team-grid team-grid-single" style="margin-top:24px;">
      <div class="card">
        <h3>Team connection map</h3>
        <div class="team-map-controls">
          <label>
            Filter by archetype
            <select id="teamFilter">
              <option value="All">All</option>
            </select>
          </label>
          <label>
            Filter by role
            <select id="teamRoleFilter">
              <option value="All">All</option>
              <option value="Player">Player</option>
              <option value="Coach">Coach</option>
            </select>
          </label>
          <label class="toggle">
            <input type="checkbox" id="teamShowNames" checked />
            <span>Show names</span>
          </label>
          <button class="btn ghost" id="teamReset">Reset view</button>
        </div>
        <div class="team-map-wrap">
          <div id="teamMap"></div>
          <aside class="team-map-panel">
            <h4>Snapshot</h4>
            <div id="teamConnections">
              <p class="hint">Select a person to see their communication overview.</p>
            </div>
          </aside>
        </div>
        <div class="team-map-legend">
          <span><strong>Legend</strong></span>
          <span class="legend-item"><span class="legend-arc"></span> Pairing synergy</span>
        </div>
        <p class="team-map-explain">Each name sits on the line between their Primary and Secondary archetypes. Grey lines show individual links to those archetypes. Orange fired lines highlight synergy matches.</p>
      </div>
      <div class="card">
        <h3>Team profile</h3>
        <div id="teamProfile" class="team-list team-profile-compact"></div>
      </div>
    </div>
    <div class="card" style="margin-top:24px;">
      <h3>Team Cognitive Profile</h3>
      <div id="teamMetrics" class="team-metrics"></div>
    </div>
    <div class="card" style="margin-top:24px;">
      <h3>Individuals overview</h3>
      <div id="teamIndividuals" class="team-list"></div>
    </div>
    <div class="actions" style="margin-top:24px;">
      <button class="btn primary" id="teamPdfBtn" ${state.teamRows.length ? '' : 'disabled'}>Download team results PDF</button>
    </div>
  `;

  document.getElementById('teamFile').addEventListener('change', handleTeamFile);
  const teamPdfBtn = document.getElementById('teamPdfBtn');
  if (teamPdfBtn) {
    teamPdfBtn.addEventListener('click', () => {
      downloadTeamPDF(state.teamRows);
    });
  }
  const filterSelect = document.getElementById('teamFilter');
  if (filterSelect && filterSelect.options.length <= 1) {
    state.archetypes.forEach((arch) => {
      const opt = document.createElement('option');
      opt.value = arch.name;
      opt.textContent = arch.name;
      filterSelect.appendChild(opt);
    });
  }
  if (filterSelect) {
    filterSelect.value = state.teamMapOptions.filter;
  }
  const showNamesToggle = document.getElementById('teamShowNames');
  if (showNamesToggle) {
    showNamesToggle.checked = state.teamMapOptions.showNames;
  }
  const roleSelect = document.getElementById('teamRoleFilter');
  if (roleSelect) {
    roleSelect.value = state.teamMapOptions.role;
  }

  document.getElementById('teamFilter').addEventListener('change', (event) => {
    state.teamMapOptions.filter = event.target.value;
    state.teamMapOptions.selectedPerson = null;
    renderTeamConnectionMap(state.teamRows);
  });
  document.getElementById('teamRoleFilter').addEventListener('change', (event) => {
    state.teamMapOptions.role = event.target.value;
    state.teamMapOptions.selectedPerson = null;
    renderTeamConnectionMap(state.teamRows);
  });
  document.getElementById('teamShowNames').addEventListener('change', (event) => {
    state.teamMapOptions.showNames = event.target.checked;
    state.teamMapOptions.selectedPerson = null;
    renderTeamConnectionMap(state.teamRows);
  });
  document.getElementById('teamReset').addEventListener('click', () => {
    state.teamMapOptions = {
      filter: 'All',
      showNames: true,
      role: 'All',
      selectedPerson: null,
    };
    document.getElementById('teamFilter').value = 'All';
    document.getElementById('teamRoleFilter').value = 'All';
    document.getElementById('teamShowNames').checked = true;
    renderTeamConnectionMap(state.teamRows);
    const panel = document.getElementById('teamConnections');
    if (panel) {
      panel.innerHTML = '<p class="hint">Select a person to see their communication overview.</p>';
    }
  });
};

const handleTeamFile = async (event) => {
  const file = event.target.files[0];
  const errors = document.getElementById('teamErrors');
  if (!file) return;
  if (!window.XLSX) {
    errors.textContent = 'SheetJS is not loaded. Check your connection or local fallback.';
    return;
  }
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const required = ['Name', 'Primary Archetype', 'Secondary Archetype'];
  const missing = required.filter((head) => !Object.keys(rows[0] || {}).includes(head));
  if (missing.length > 0) {
    errors.textContent = `Missing headers: ${missing.join(', ')}`;
    return;
  }

  errors.textContent = '';
  const cleaned = rows.map((row) => ({
    name: row['Name'].toString().trim(),
    primary: row['Primary Archetype'].toString().trim(),
    secondary: row['Secondary Archetype'].toString().trim(),
    role: row['Role'] ? row['Role'].toString().trim() : 'Player',
  })).filter((row) => row.name && row.primary);

  buildTeamDashboard(cleaned);
};

const buildTeamDashboard = (rows) => {
  state.teamRows = rows;
  const primaryCounts = {};
  const secondaryCounts = {};
  rows.forEach((row) => {
    primaryCounts[row.primary] = (primaryCounts[row.primary] || 0) + 1;
    if (row.secondary) {
      secondaryCounts[row.secondary] = (secondaryCounts[row.secondary] || 0) + 1;
    }
  });

  renderTeamConnectionMap(rows);
  renderTeamProfile(primaryCounts, rows.length);
  renderIndividuals(rows);
  renderTeamMetrics(rows);
  const teamPdfBtn = document.getElementById('teamPdfBtn');
  if (teamPdfBtn) {
    teamPdfBtn.disabled = !rows.length;
  }
};

const renderTeamChart = (primaryCounts, secondaryCounts) => {
  const chartEl = document.getElementById('teamChart');
  if (!window.Plotly) {
    chartEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Chart unavailable. Refresh page to load visualization.</p>';
    return;
  }

  if (!Object.keys(primaryCounts).length && !Object.keys(secondaryCounts).length) {
    chartEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Upload a team file to see the distribution.</p>';
    return;
  }

  const colors = {
    'Anchor': '#1f77b4',
    'Connector': '#ff7f0e',
    'Navigator': '#2ca02c',
    'Guardian': '#d62728',
    'Explorer': '#9467bd',
    'Energiser': '#8c564b',
    'Synchroniser': '#e377c2',
    'Decision-Maker': '#7f7f7f',
    'Innovator': '#bcbd22',
  };

  const primaryLabels = Object.keys(primaryCounts).sort();
  const primaryValues = primaryLabels.map((key) => primaryCounts[key]);
  const primaryColors = primaryLabels.map((key) => colors[key] || '#111');
  const primaryDescriptors = primaryLabels.map((key) => (state.archetypeMap[key] || {}).descriptor || 'Descriptor unavailable.');

  const secondaryLabels = Object.keys(secondaryCounts).sort();
  const secondaryValues = secondaryLabels.map((key) => secondaryCounts[key]);
  const secondaryColors = secondaryLabels.map((key) => colors[key] || '#111');
  const secondaryDescriptors = secondaryLabels.map((key) => (state.archetypeMap[key] || {}).descriptor || 'Descriptor unavailable.');

  const data = [
    {
      type: 'pie',
      labels: primaryLabels,
      values: primaryValues,
      hole: 0.55,
      textinfo: 'label+percent',
      textposition: 'inside',
      marker: { colors: primaryColors, line: { color: '#fff', width: 2 } },
      hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>Percent: %{percent}<br>%{customdata}<extra></extra>',
      customdata: primaryDescriptors,
      sort: false,
      direction: 'clockwise',
      name: 'Primary archetypes',
    },
    {
      type: 'pie',
      labels: secondaryLabels,
      values: secondaryValues,
      hole: 0.75,
      textinfo: 'none',
      marker: { colors: secondaryColors, line: { color: '#fff', width: 2 } },
      hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>Percent: %{percent}<br>%{customdata}<extra></extra>',
      customdata: secondaryDescriptors,
      sort: false,
      direction: 'clockwise',
      name: 'Secondary archetypes',
    },
  ];

  const layout = {
    margin: { t: 10, b: 10, l: 10, r: 10 },
    showlegend: false,
    paper_bgcolor: '#fff',
    font: { family: '"Inter", sans-serif', color: '#111' },
  };

  Plotly.newPlot(chartEl, data, layout, { displayModeBar: false, responsive: true });
};

const renderTeamConnectionMap = (rows) => {
  const mapEl = document.getElementById('teamMap');
  if (!mapEl) return;
  if (!window.Plotly) {
    mapEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Connection map unavailable. Refresh page to load visualisation.</p>';
    return;
  }

  if (!rows || !rows.length) {
    mapEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Upload a team file to see the connection map.</p>';
    return;
  }

  const connectionsPanel = document.getElementById('teamConnections');
  if (connectionsPanel && !state.teamMapOptions.selectedPerson) {
    connectionsPanel.innerHTML = '<p class="hint">Select a person to see their communication overview.</p>';
  }

  if (mapEl.removeAllListeners) {
    mapEl.removeAllListeners('plotly_hover');
    mapEl.removeAllListeners('plotly_unhover');
    mapEl.removeAllListeners('plotly_click');
  }

  const archetypes = state.archetypes.map((a) => a.name);
  const radius = 3.0;
  const archetypePositions = archetypes.reduce((acc, name, idx) => {
    const angle = (idx / archetypes.length) * Math.PI * 2 - Math.PI / 2;
    acc[name] = {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
    return acc;
  }, {});

  const filter = state.teamMapOptions.filter;
  const showNames = state.teamMapOptions.showNames;
  const roleFilter = state.teamMapOptions.role;

  const filteredRows = rows.filter((row) => {
    const roleMatch = roleFilter === 'All' || row.role === roleFilter;
    const archetypeMatch = filter === 'All' || row.primary === filter || row.secondary === filter;
    return roleMatch && archetypeMatch;
  });

  const personNodes = filteredRows.map((row, index) => {
    const primaryPos = archetypePositions[row.primary] || { x: 0, y: 0 };
    const secondaryPos = archetypePositions[row.secondary] || primaryPos;
    const seed = hashString(row.name + row.primary + index);
    const tJitter = ((seed % 7) - 3) / 22;
    const t = Math.min(0.6, Math.max(0.18, 0.32 + tJitter));
    const baseX = primaryPos.x + (secondaryPos.x - primaryPos.x) * t;
    const baseY = primaryPos.y + (secondaryPos.y - primaryPos.y) * t;
    const jitter = 0.28;
    const angle = (seed % 360) * (Math.PI / 180);
    return {
      ...row,
      anchorX: baseX,
      anchorY: baseY,
      x: baseX + Math.cos(angle) * jitter,
      y: baseY + Math.sin(angle) * jitter,
      primaryPos,
      secondaryPos,
    };
  });

  // Resolve overlaps by pushing nearby names apart while retaining their anchor relation.
  const minDistance = 0.42;
  const maxNodeRadius = 2.82;
  for (let step = 0; step < 140; step += 1) {
    for (let i = 0; i < personNodes.length; i += 1) {
      for (let j = i + 1; j < personNodes.length; j += 1) {
        const a = personNodes[i];
        const b = personNodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        if (dist >= minDistance) continue;
        const push = ((minDistance - dist) / dist) * 0.5;
        const ox = dx * push;
        const oy = dy * push;
        a.x -= ox;
        a.y -= oy;
        b.x += ox;
        b.y += oy;
      }
    }
    personNodes.forEach((node) => {
      node.x += (node.anchorX - node.x) * 0.08;
      node.y += (node.anchorY - node.y) * 0.08;
      const r = Math.hypot(node.x, node.y);
      if (r > maxNodeRadius) {
        const scale = maxNodeRadius / r;
        node.x *= scale;
        node.y *= scale;
      }
    });
  }

  const personLineX = [];
  const personLineY = [];
  personNodes.forEach((person) => {
    personLineX.push(person.x, person.primaryPos.x, null);
    personLineY.push(person.y, person.primaryPos.y, null);
    if (person.secondaryPos) {
      personLineX.push(person.x, person.secondaryPos.x, null);
      personLineY.push(person.y, person.secondaryPos.y, null);
    }
  });

  const personLineTrace = {
    type: 'scatter',
    mode: 'lines',
    x: personLineX,
    y: personLineY,
    line: { color: 'rgba(17,17,17,0.2)', width: 1 },
    hoverinfo: 'skip',
    showlegend: false,
  };

  const synergyTraces = [];
  const synergyMeta = [];
  personNodes.forEach((person) => {
    const profile = state.archetypeMap[person.primary];
    const partner = profile ? profile.synergyPartner : null;
    if (!partner) return;
    const targets = personNodes.filter((node) => node.primary === partner);
    if (!targets.length) return;
    const lineX = [];
    const lineY = [];
    targets.forEach((target) => {
      lineX.push(person.x, target.x, null);
      lineY.push(person.y, target.y, null);
    });
    synergyTraces.push({
      type: 'scatter',
      mode: 'lines',
      x: lineX,
      y: lineY,
      line: { color: 'rgba(255,107,53,0)', width: 2 },
      hoverinfo: 'skip',
      showlegend: false,
    });
    synergyMeta.push({ person: person.name, partner });
  });

  const archetypeX = archetypes.map((name) => archetypePositions[name].x);
  const archetypeY = archetypes.map((name) => archetypePositions[name].y);
  const archetypeLabels = archetypes.map((name) => name.toUpperCase());
  const archetypeLabelRadius = 3.55;
  const archetypeLabelX = archetypes.map((name, idx) => {
    const angle = (idx / archetypes.length) * Math.PI * 2 - Math.PI / 2;
    return Math.cos(angle) * archetypeLabelRadius;
  });
  const archetypeLabelY = archetypes.map((name, idx) => {
    const angle = (idx / archetypes.length) * Math.PI * 2 - Math.PI / 2;
    return Math.sin(angle) * archetypeLabelRadius;
  });

  const primaryCounts = archetypes.map((name) => filteredRows.filter((row) => row.primary === name).length);
  const secondaryCounts = archetypes.map((name) => filteredRows.filter((row) => row.secondary === name).length);
  const archetypeHover = archetypes.map((name, idx) => {
    const descriptor = (state.archetypeMap[name] || {}).descriptor || 'Descriptor unavailable.';
    return `<b>${name}</b><br>Primary: ${primaryCounts[idx]}<br>Secondary: ${secondaryCounts[idx]}<br>${descriptor}`;
  });

  const archetypeSizes = primaryCounts.map((count) => Math.min(12 + count * 4, 36));

  const archetypeMarkerTrace = {
    type: 'scatter',
    mode: 'markers',
    x: archetypeX,
    y: archetypeY,
    marker: {
      size: archetypeSizes,
      color: archetypes.map((name) => archetypeColours[name] || '#111'),
      line: { color: '#fff', width: 2 },
    },
    hovertemplate: '%{customdata}<extra></extra>',
    customdata: archetypeHover,
    showlegend: false,
  };

  const archetypeLabelTrace = {
    type: 'scatter',
    mode: 'text',
    x: archetypeLabelX,
    y: archetypeLabelY,
    text: archetypeLabels,
    textposition: 'middle center',
    textfont: { size: 12, color: '#ff6b35', family: '"Inter", sans-serif', weight: 700 },
    hoverinfo: 'skip',
    showlegend: false,
  };

  const personTextPositions = personNodes.map((p) => {
    const angle = Math.atan2(p.y, p.x);
    if (angle >= -Math.PI / 4 && angle < Math.PI / 4) return 'middle right';
    if (angle >= Math.PI / 4 && angle < (3 * Math.PI) / 4) return 'top center';
    if (angle >= -(3 * Math.PI) / 4 && angle < -Math.PI / 4) return 'bottom center';
    return 'middle left';
  });

  const personTrace = {
    type: 'scatter',
    mode: showNames ? 'markers+text' : 'markers',
    name: 'persons',
    x: personNodes.map((p) => p.x),
    y: personNodes.map((p) => p.y),
    text: personNodes.map((p) => p.name),
    textposition: personTextPositions,
    textfont: { size: 12, color: '#111', family: '"Inter", sans-serif' },
    marker: {
      size: 8,
      color: personNodes.map((p) => archetypeColours[p.primary] || '#111'),
      line: { color: '#fff', width: 1 },
    },
    customdata: personNodes.map((p) => p.name),
    hovertemplate: '<b>%{customdata}</b><extra></extra>',
    showlegend: false,
  };

  const layout = {
    margin: { t: 10, b: 10, l: 10, r: 10 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: { visible: false, range: [-4.8, 4.8] },
    yaxis: { visible: false, range: [-4.8, 4.8], scaleanchor: 'x' },
    hovermode: 'closest',
    hoverlabel: { bgcolor: '#111', bordercolor: '#111', font: { color: '#fff', size: 12 }, align: 'left', namelength: -1 },
  };

  const traces = [
    personLineTrace,
    ...synergyTraces,
    archetypeMarkerTrace,
    personTrace,
    archetypeLabelTrace,
  ];

  Plotly.newPlot(mapEl, traces, layout, { displayModeBar: false, responsive: true });

  if (state.teamMapTimer) {
    clearInterval(state.teamMapTimer);
  }
  if (synergyTraces.length) {
    let active = 0;
    state.teamMapTimer = setInterval(() => {
      const colours = synergyTraces.map((_, idx) => (idx === active ? 'rgba(255,107,53,0.95)' : 'rgba(255,107,53,0)'));
      Plotly.restyle(mapEl, { 'line.color': colours }, synergyTraces.map((_, idx) => idx + 1));
      active = (active + 1) % synergyTraces.length;
    }, 3000);
  }

  const renderPersonConnections = (person) => {
    if (!person || !connectionsPanel) return;
    const pref = getPrefs(person.primary) || {};
    connectionsPanel.innerHTML = `
      <p><strong>${person.name}</strong></p>
      <p><strong>Goal communication:</strong> ${pref.goalComms || 'Not set'}</p>
      <p><strong>Feedback:</strong> ${pref.feedbackStyle || 'Not set'}</p>
    `;
  };

  mapEl.on('plotly_hover', (event) => {
    const point = event.points && event.points[0];
    if (!point || !point.data || point.data.name !== 'persons') return;
    const person = personNodes[point.pointIndex];
    renderPersonConnections(person);
  });

  mapEl.on('plotly_click', (event) => {
    const point = event.points && event.points[0];
    if (!point || !point.data || point.data.name !== 'persons') return;
    const person = personNodes[point.pointIndex];
    if (!person) return;
    state.teamMapOptions.selectedPerson = person.name;
    renderPersonConnections(person);
  });

  mapEl.on('plotly_unhover', () => {});
};

const renderTeamProfile = (primaryCounts, total) => {
  const container = document.getElementById('teamProfile');
  const sorted = Object.entries(primaryCounts).sort((a, b) => b[1] - a[1]);
  const topTwo = sorted.slice(0, 2).map((item) => item[0]);
  const missing = state.archetypes.map((a) => a.name).filter((name) => !primaryCounts[name]);

  const topArchetypes = topTwo.map(name => state.archetypeMap[name]);
  const commPrefs = topArchetypes.map(a => `${a.archetype}: ${a.communication.split('.')[0]}`).join('; ');

  container.innerHTML = `
    <p><strong>Most common archetypes:</strong> ${topTwo.join(', ') || 'Not enough data'}</p>
    <p><strong>Least represented:</strong> ${missing.length ? missing.join(', ') : 'None missing'}</p>
    <div style="background: #f7f7f7; padding: 12px; border-radius: 8px; margin: 12px 0;">
      <p style="margin: 0 0 8px;"><strong>Communication insights:</strong></p>
      <p style="margin: 0; font-size: 0.9rem; color: #5e5e5e;">${commPrefs}</p>
    </div>
    <p><strong>How to brief this group:</strong> Lead with clear outcomes, then confirm tempo and ownership. Keep the opening short and purposeful.</p>
    <p><strong>How to handle pressure moments:</strong> Set a reset word, align on the next decision, and reinforce a calm tempo. Call out what each archetype needs to reset: Anchors need structure, Connectors need inclusion, Navigators need direction.</p>
  `;
};

const renderIndividuals = (rows) => {
  const container = document.getElementById('teamIndividuals');
  container.innerHTML = '';
  
  const players = rows.filter(r => !r.role || r.role === 'Player');
  const coaches = rows.filter(r => r.role === 'Coach');
  
  const buildGroupedList = (items) => {
    const grouped = items.reduce((acc, row) => {
      acc[row.primary] = acc[row.primary] || [];
      acc[row.primary].push(row);
      return acc;
    }, {});
    
    let html = '';
    Object.keys(grouped).sort().forEach((arch) => {
      const pref = getPrefs(arch) || {};
      const details = pref.goalPreference ? `
        <div class="team-archetype-details">
          <p><strong>How goals work:</strong> ${pref.goalPreference}</p>
          <p><strong>Goal communication:</strong> ${pref.goalComms}</p>
          <p><strong>Feedback style:</strong> ${pref.feedbackStyle}</p>
          <p><strong>Under pressure watch-outs:</strong> ${pref.watchouts}</p>
        </div>
      ` : '';
      html += `<div class="team-list-section"><h5 class="team-archetype-title">${arch.toUpperCase()}</h5>${details}`;
      grouped[arch].forEach((person) => {
        const archData = state.archetypeMap[person.primary] || {};
        const template = state.templates[person.primary] || {};
        html += `
          <div class="person-row">
            <div class="person-name">${person.name}</div>
            <div style="font-size: 0.9rem; color: #666;">Primary: ${person.primary} | Secondary: ${person.secondary || 'Not set'}</div>
            <div style="font-size: 0.9rem; color: #666;">Role: ${template.role || 'Role not set'}</div>
            <div style="font-size: 0.9rem; color: #666;"><strong>Comms:</strong> ${archData.communication ? archData.communication.split('.')[0] : 'Not set'}</div>
            <div class="tooltip">
              <strong>At best:</strong>
              <p>${template.best || 'Not set'}</p>
              <strong>Under pressure:</strong>
              <p>${template.drift || 'Not set'}</p>
            </div>
          </div>
        `;
      });
      html += '</div>';
    });
    return html;
  };
  
  let content = '<div style="display: grid; gap: 32px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">';
  
  if (players.length > 0) {
    content += `<div><h4 style="margin-top: 0; color: #111;">Players</h4>${buildGroupedList(players)}</div>`;
  }
  
  if (coaches.length > 0) {
    content += `<div><h4 style="margin-top: 0; color: #111;">Coaches</h4>${buildGroupedList(coaches)}</div>`;
  }
  
  content += '</div>';
  container.innerHTML = content;
};

const renderTeamMetrics = (rows) => {
  const container = document.getElementById('teamMetrics');
  if (!container) return;

  const primaryArchetypes = rows.map((row) => row.primary).filter(Boolean);
  const scoreList = primaryArchetypes.map((arch) => getPrefs(arch)).filter(Boolean);

  const average = (list, key) => {
    if (!list.length) return 5;
    const total = list.reduce((sum, item) => sum + clampScore(item[key]), 0);
    return Math.round((total / list.length) * 10) / 10;
  };

  const exploreAvg = average(scoreList, 'exploreExploit');
  const paceAvg = average(scoreList, 'pacePrecision');
  const riskAvg = average(scoreList, 'riskTolerance');

  const teamExplore = exploreAvg >= 7
    ? 'The team leans toward exploration and adaptive goal framing.'
    : exploreAvg <= 3
      ? 'The team leans toward exploit goals and structured execution.'
      : 'The team sits near the middle, able to switch between explore and exploit.';

  const teamExploreBlind = exploreAvg >= 7
    ? 'Blind spot: under fatigue, execution can lose structure and consistency.'
    : exploreAvg <= 3
      ? 'Blind spot: innovation can be resisted when the plan is locked.'
      : 'Blind spot: the group can drift toward the safest option under pressure.';

  const teamExploreAdjust = exploreAvg >= 7
    ? 'Adjustment: time-box exploration, then lock one decision point before action.'
    : exploreAvg <= 3
      ? 'Adjustment: schedule short exploration sprints and test one new option.'
      : 'Adjustment: agree what must stay stable and what can flex in the next cycle.';

  const teamPace = paceAvg >= 7
    ? 'The team is pace dominant and works best with fast iteration.'
    : paceAvg <= 3
      ? 'The team is precision dominant and prefers refined execution.'
      : 'The team balances pace and precision, switching based on context.';

  const teamPaceBlind = paceAvg >= 7
    ? 'Blind spot: rushing can lower quality or miss detail under stress.'
    : paceAvg <= 3
      ? 'Blind spot: decision time can expand and slow momentum.'
      : 'Blind spot: tempo can become unclear if roles are not defined.';

  const teamPaceAdjust = paceAvg >= 7
    ? 'Adjustment: define one quality gate before accelerating pace.'
    : paceAvg <= 3
      ? 'Adjustment: time-box refinement and commit to the next action.'
      : 'Adjustment: set a clear tempo and confirm the quality threshold.';

  const teamRisk = riskAvg >= 7
    ? 'The team is comfortable with risk and decisive action.'
    : riskAvg <= 3
      ? 'The team is risk cautious and values control.'
      : 'The team has a measured risk profile.';

  const teamRiskBlind = riskAvg >= 7
    ? 'Blind spot: exposure rises when time pressure spikes.'
    : riskAvg <= 3
      ? 'Blind spot: hesitation can appear when uncertainty grows.'
      : 'Blind spot: risk tolerance can swing with social pressure.';

  const teamRiskAdjust = riskAvg >= 7
    ? 'Adjustment: agree non-negotiable controls before bold moves.'
    : riskAvg <= 3
      ? 'Adjustment: pre-define acceptable risk and a safe route forward.'
      : 'Adjustment: clarify the decision rule and commit once it is met.';

  container.innerHTML = `
    <div class="team-metrics-grid">
      <div class="team-metric-card animate-on-view" data-type="ring" data-value="${exploreAvg}">
        <div class="ring-metric">
          <svg class="ring-svg" viewBox="0 0 120 120" aria-hidden="true">
            <circle class="ring-track" cx="60" cy="60" r="48"></circle>
            <circle class="ring-progress" cx="60" cy="60" r="48"></circle>
          </svg>
          <div class="ring-value">0/9</div>
          <div class="ring-label">Explore ↔ Exploit</div>
        </div>
        <p>${teamExplore}</p>
        <p>${teamExploreBlind}</p>
        <p>${teamExploreAdjust}</p>
      </div>
      <div class="team-metric-card animate-on-view" data-type="ring" data-value="${paceAvg}">
        <div class="ring-metric">
          <svg class="ring-svg" viewBox="0 0 120 120" aria-hidden="true">
            <circle class="ring-track" cx="60" cy="60" r="48"></circle>
            <circle class="ring-progress" cx="60" cy="60" r="48"></circle>
          </svg>
          <div class="ring-value">0/9</div>
          <div class="ring-label">Pace ↔ Precision</div>
        </div>
        <p>${teamPace}</p>
        <p>${teamPaceBlind}</p>
        <p>${teamPaceAdjust}</p>
      </div>
      <div class="team-metric-card animate-on-view" data-type="ring" data-color="risk" data-value="${riskAvg}">
        <div class="ring-metric">
          <svg class="ring-svg" viewBox="0 0 120 120" aria-hidden="true">
            <circle class="ring-track" cx="60" cy="60" r="48"></circle>
            <circle class="ring-progress" cx="60" cy="60" r="48"></circle>
          </svg>
          <div class="ring-value">0/9</div>
          <div class="ring-label">Risk tolerance</div>
        </div>
        <p>${teamRisk}</p>
        <p>${teamRiskBlind}</p>
        <p>${teamRiskAdjust}</p>
      </div>
    </div>
  `;

  initMetricObserver(container);
};

const handleRoute = () => {
  let hash = window.location.hash.replace('#', '');
  if (!hash) {
    hash = ensureResults() ? 'results' : 'home';
    window.location.hash = `#${hash}`;
  }
  setActiveTab(hash);
  if (hash === 'start') {
    elements.assessment.hidden = false;
    elements.structuralFlow.innerHTML = '';
    renderAssessment();
    updateLockInState();
  }
  if (hash === 'results') renderResults();
  if (hash === 'team') renderTeamGate();
};

const renderExamples = () => {
  const examplesEl = document.getElementById('examplesSection');
  if (!examplesEl) return;
  
  const examples = [
    { num: 1, text: 'Maintains composure and restructures when the mission changes.' },
    { num: 2, text: 'Reads the team and builds cohesion before action.' },
    { num: 3, text: 'Anticipates the next move and navigates with clarity.' },
    { num: 4, text: 'Identifies risks and ensures nothing essential is overlooked.' },
    { num: 5, text: 'Questions assumptions and introduces new perspectives.' },
    { num: 6, text: 'Accelerates momentum and raises collective intensity.' },
    { num: 7, text: 'Coordinates timing and keeps the team moving as one.' },
    { num: 8, text: 'Decides quickly and communicates the next instruction.' },
    { num: 9, text: 'Challenges the status quo and elevates performance standards.' },
  ];
  
  examplesEl.innerHTML = `
    <div class="examples-section">
      <p class="examples-title">See yourself in one of these</p>
      <ul class="examples-list">
        ${examples.map((ex) => `<li>${ex.num}. ${ex.text}</li>`).join('')}
      </ul>
    </div>
  `;
};

const loadData = async () => {
  const [summary, full, prefs] = await Promise.all([
    fetch('assets/data/archetypes.json').then((res) => res.json()),
    fetch('assets/data/archetypes_full.json').then((res) => res.json()),
    fetch('assets/data/archetype_goal_risk_pace.json').then((res) => res.json()),
  ]);

  state.archetypes = summary.items;
  full.items.forEach((row) => {
    state.archetypeMap[row.archetype] = row;
  });

  state.goalRiskPace = prefs.items || [];
  state.goalRiskPace.forEach((row) => {
    state.goalRiskPaceMap[row.archetype] = row;
  });

  renderAssessment();
  renderExamples();
  renderResults();
  renderTeamGate();
};

const initNav = () => {
  elements.navToggle.addEventListener('click', () => {
    const open = elements.navMenu.classList.toggle('open');
    elements.navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  elements.navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      elements.navMenu.classList.remove('open');
      elements.navToggle.setAttribute('aria-expanded', 'false');
    });
  });
};

elements.lockInBtn.addEventListener('click', handleLockIn);
elements.resetBtn.addEventListener('click', handleResetPreferences);
window.addEventListener('hashchange', handleRoute);

updateBadge();
initNav();
loadData().then(handleRoute);
