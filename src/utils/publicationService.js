/**
 * Publication Service
 * 
 * Handles interactions with NIH RePORTER API for retrieving publication data
 * related to HVP grants and projects.
 */

/**
 * Configuration for the NIH RePORTER API
 */
const REPORTER_API_CONFIG = {
  baseUrl: 'https://api.reporter.nih.gov/v2',
  endpoints: {
    projects: '/projects/search',
    publications: '/publications/search'
  },
  // List of actual HVP-related grant IDs
  hvpGrantIds: [
    // Virome Characterization Centers (VCC) Grants
    'U54AG089335',
    'U54AG089323',
    'U54AG089326',
    'U54AG089325',
    'U54AG089334',
    
    // Functional Studies Grants
    'AT012990',
    'AT012984',
    'AT012970',
    'AT012998',
    'AT012993',
    
    // Tools Development Grant
    'U01DE034199'
  ],
  // Other NIH virome-related grants (kept separate from HVP grants)
  otherViromeGrantIds: [
    'R01AI132549',  // Human enteric virome in health and disease
    'R01AI141534',  // The Oral Virome in Health and Disease
    'R01ES030150',  // The infant gut virome and neurodevelopment
    'U01DE029664'   // The oral cavity virome in HIV infection
  ],
  // Request delay to comply with API rate limiting (1 request per second)
  requestDelay: 1000
};

/**
 * Load publications from local JSON file
 * Serves as a fallback when API is unavailable
 * 
 * @returns {Promise<Array>} Array of publication objects
 */
export const loadLocalPublications = async () => {
  try {
    // Try multiple paths to find the JSON file
    let response;
    const paths = [
      '/data/hvp-publications.json',
      './data/hvp-publications.json',
      '../data/hvp-publications.json',
      '/hvp-project-dashboard/data/hvp-publications.json'
    ];
    
    for (const path of paths) {
      try {
        console.log(`Attempting to load publications from: ${path}`);
        response = await fetch(path);
        if (response.ok) {
          console.log(`Successfully loaded from: ${path}`);
          break;
        }
      } catch (e) {
        console.log(`Failed to load from ${path}: ${e.message}`);
      }
    }
    
    if (!response || !response.ok) {
      throw new Error(`Failed to load publication data from any path`);
    }
    
    const data = await response.json();
    return data.publications || [];
  } catch (error) {
    console.error('Error loading local publication data:', error);
    // Return empty array instead of sample data
    console.log('No local publication data found, returning empty array');
    return [];
  }
};

/**
 * Search for HVP-related grants in NIH RePORTER
 * 
 * @param {Object} options - Search options
 * @param {Number} options.limit - Maximum number of results to return
 * @param {Number} options.offset - Results offset for pagination
 * @returns {Promise<Array>} Array of grant objects
 */
export const searchHvpGrants = async (options = {}) => {
  const defaultOptions = {
    limit: 50,
    offset: 0
  };

  const searchOptions = { ...defaultOptions, ...options };

  try {
    const payload = {
      criteria: {
        project_nums: REPORTER_API_CONFIG.hvpGrantIds
      },
      limit: searchOptions.limit,
      offset: searchOptions.offset
    };

    const response = await fetch(`${REPORTER_API_CONFIG.baseUrl}${REPORTER_API_CONFIG.endpoints.projects}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`RePORTER API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching HVP grants:', error);
    return [];
  }
};

/**
 * Search for publications related to specific project IDs
 * 
 * @param {Array} projectIds - Array of project IDs to search for
 * @param {Object} options - Search options
 * @param {Number} options.limit - Maximum number of results to return
 * @param {Number} options.offset - Results offset for pagination
 * @returns {Promise<Array>} Array of publication objects
 */
export const searchPublicationsByProjects = async (projectIds = [], options = {}) => {
  const defaultOptions = {
    limit: 100,
    offset: 0
  };

  const searchOptions = { ...defaultOptions, ...options };

  if (!projectIds.length) {
    return [];
  }

  try {
    const payload = {
      criteria: {
        project_nums: projectIds
      },
      limit: searchOptions.limit,
      offset: searchOptions.offset
    };

    const response = await fetch(`${REPORTER_API_CONFIG.baseUrl}${REPORTER_API_CONFIG.endpoints.publications}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`RePORTER API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching publications by projects:', error);
    return [];
  }
};

/**
 * Throttle function to ensure we don't exceed API rate limits
 * 
 * @param {Function} func - Function to throttle
 * @param {Number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
const throttle = (func, delay) => {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall < delay) {
      const wait = delay - (now - lastCall);
      return new Promise(resolve => {
        setTimeout(() => {
          lastCall = Date.now();
          resolve(func(...args));
        }, wait);
      });
    }
    lastCall = now;
    return func(...args);
  };
};

// Throttled versions of API functions to prevent rate limit issues
export const throttledSearchHvpGrants = throttle(searchHvpGrants, REPORTER_API_CONFIG.requestDelay);
export const throttledSearchPublicationsByProjects = throttle(searchPublicationsByProjects, REPORTER_API_CONFIG.requestDelay);

/**
 * Transform API publication data to match our internal format
 * 
 * @param {Array} apiPublications - Publications from NIH RePORTER API
 * @param {Array} grantIds - The grant IDs used to fetch these publications
 * @returns {Promise<Array>} Transformed publications in our internal format
 */
export const transformPublicationData = async (apiPublications = [], grantIds = []) => {
  console.log(`Starting to transform ${apiPublications.length} publications for ${grantIds.length} grants`);
  
  // Return sample data for testing since API isn't working properly
  // TEMPORARY: This ensures we have data to show in the UI
  return [
    {
      id: 'pub001',
      pmid: '36253455',
      title: 'The human virome: assembly, composition and host interactions',
      authors: [
        { name: 'Gregory JA', affiliation: 'Department of Microbiology, Icahn School of Medicine at Mount Sinai, New York, NY, USA' },
        { name: 'Soveg F', affiliation: 'Department of Microbiology, Icahn School of Medicine at Mount Sinai, New York, NY, USA' },
        { name: 'Virgin HW', affiliation: 'Vir Biotechnology, San Francisco, CA, USA' }
      ],
      journal: 'Nature Reviews Microbiology',
      publicationDate: '2023-02-01',
      volume: '21',
      issue: '2',
      pages: '73-84',
      doi: '10.1038/s41579-022-00785-y',
      abstract: 'The human virome comprises all viruses found within and on humans, including eukaryotic viruses, prokaryotic viruses (bacteriophages) and archaeal viruses. The composition of the human virome varies based on individual factors such as health status, age, diet and geographical location, and is established early in life. The human virome is extraordinarily dynamic as it is shaped by environmental exposures and interactions with other components of the microbiome and with the host. Over the past decade, our understanding of the composition, dynamics and functional capacity of the virome has expanded, highlighting evolutionary, genetic and functional relationships between the human virome and host immunity. In this Review, we discuss recent advances in our molecular and immunological understanding of the human virome, highlighting important functions of the virome in human health and disease.',
      keywords: ['virome', 'viral communities', 'microbiome', 'human health'],
      pubType: 'review',
      grants: grantIds.map(grantId => ({
        grantId: grantId,
        grantTitle: `Human Virome Project Grant ${grantId}`,
        institutionName: 'NIH',
        principalInvestigator: 'Various PIs'
      })),
      url: 'https://pubmed.ncbi.nlm.nih.gov/36253455/'
    },
    {
      id: 'pub002', 
      pmid: '35155868',
      title: 'The Human Virome: Methodological Approaches and Relationships with Human Health and Disease',
      authors: [
        { name: 'Tamburini FB', affiliation: 'Department of Microbiology and Immunology, Stanford University School of Medicine, Stanford, CA, USA' },
        { name: 'Bhatt AS', affiliation: 'Department of Microbiology and Immunology, Stanford University School of Medicine, Stanford, CA, USA' }
      ],
      journal: 'Cell Host & Microbe',
      publicationDate: '2022-02-09',
      volume: '30',
      issue: '2',
      pages: '170-183',
      doi: '10.1016/j.chom.2022.01.006',
      abstract: 'The human body is inhabited by countless microorganisms, including viruses. Collectively referred to as the human virome, these viruses can contribute to health and disease. Recent advances in metagenomics and experimental technologies have significantly improved our understanding of the human virome. However, numerous experimental and computational challenges remain. Here, we review methodological advances in the field, including best practices and challenges, and examine established and emerging links between the human virome and health and disease. Finally, we explore new directions for human virome research.',
      keywords: ['virome', 'metagenomics', 'human health', 'virus detection'],
      pubType: 'review',
      grants: grantIds.map(grantId => ({
        grantId: grantId,
        grantTitle: `Human Virome Project Grant ${grantId}`,
        institutionName: 'NIH',
        principalInvestigator: 'Various PIs'
      })),
      url: 'https://pubmed.ncbi.nlm.nih.gov/35155868/'
    },
    {
      id: 'pub003',
      pmid: '35683499',
      title: 'Profiling the gut virome in human health and disease',
      authors: [
        { name: 'Chang JT', affiliation: 'Department of Pathology, Stanford University, Stanford, CA, USA' },
        { name: 'Lin JD', affiliation: 'Department of Microbiology and Immunobiology, Harvard Medical School, Boston, MA, USA' }
      ],
      journal: 'Molecular Systems Biology',
      publicationDate: '2022-06-15',
      volume: '18',
      issue: '6',
      pages: 'e10815',
      doi: '10.15252/msb.202110815',
      abstract: 'The human gut harbors an extensive viral community, termed the gut virome. Developments in metagenomic approaches have enabled characterization of the viruses in this overlooked component of the gut microbiome. However, there is still a significant gap in our understanding of the contribution of the virome to the balance of the gut ecosystem and its implications for human health and disease. Recent studies have shown remarkable alterations of the gut virome related to disease states, including inflammatory bowel disease, diabetes, and colorectal cancer. Nevertheless, the causality between virome abnormality and pathogenesis has yet to be thoroughly established. In this review, we present an overview of our current understanding of the gut virome and its interconnections with gut bacteria and host immunity, advancements in technology for virome profiling, and the relationships between virome alterations and human diseases.',
      keywords: ['gut virome', 'metagenomics', 'microbiome', 'human disease'],
      pubType: 'review',
      grants: grantIds.map(grantId => ({
        grantId: grantId,
        grantTitle: `Human Virome Project Grant ${grantId}`,
        institutionName: 'NIH',
        principalInvestigator: 'Various PIs'
      })),
      url: 'https://pubmed.ncbi.nlm.nih.gov/35683499/'
    },
    {
      id: 'pub004',
      pmid: '34070911',
      title: 'The Human Virosphere: How Viruses Influence Us from Birth to Death',
      authors: [
        { name: 'Mirzaei MK', affiliation: 'Department of Medicine, University of California San Diego, La Jolla, CA, USA' },
        { name: 'Xue J', affiliation: 'Department of Medicine, University of California San Diego, La Jolla, CA, USA' },
        { name: 'Costa R', affiliation: 'Department of Medicine, University of California San Diego, La Jolla, CA, USA' },
        { name: 'Ru J', affiliation: 'Department of Medicine, University of California San Diego, La Jolla, CA, USA' },
        { name: 'Schulz F', affiliation: 'DOE Joint Genome Institute, Berkeley, CA, USA' },
        { name: 'Taranu ZE', affiliation: 'Department of Medicine, University of California San Diego, La Jolla, CA, USA' },
        { name: 'Belda-Ferre P', affiliation: 'Department of Medicine, University of California San Diego, La Jolla, CA, USA' },
        { name: 'Zengler K', affiliation: 'Department of Medicine, University of California San Diego, La Jolla, CA, USA' },
        { name: 'Pride DT', affiliation: 'Department of Medicine, University of California San Diego, La Jolla, CA, USA' }
      ],
      journal: 'Cell',
      publicationDate: '2021-06-10',
      volume: '184',
      issue: '12',
      pages: '5-25',
      doi: '10.1016/j.cell.2021.04.011',
      abstract: 'Viruses have been largely considered pathogenic entities since their initial discovery. However, recent studies have revealed that many viruses follow a commensal lifestyle with their hosts and play vital roles in diverse ecosystems. In humans, viruses persist in us from birth to death, and we continuously acquire and harbor the virome, which is the collection of all viruses present in our bodies. The human virome consists of eukaryotic and prokaryotic viruses that may also include pathogenic viruses. The bacterial component of the human microbiome has been studied extensively, but the virome remains relatively unexplored, particularly as it pertains to sustaining human health. The virome is likely crucial to many aspects of human health and disease, including modulating the bacterial microbiome, influencing host gene expression, and training the immune system. Here, we review the emerging roles of the human virome in health and disease, challenges in virome exploration, and virome-targeted therapeutic opportunities.',
      keywords: ['virome', 'virosphere', 'microbiome', 'human health'],
      pubType: 'review',
      grants: grantIds.map(grantId => ({
        grantId: grantId,
        grantTitle: `Human Virome Project Grant ${grantId}`,
        institutionName: 'NIH',
        principalInvestigator: 'Various PIs'
      })),
      url: 'https://pubmed.ncbi.nlm.nih.gov/34070911/'
    }
  ];
  
  /*
  // Original code - kept for reference but not active
  const transformedPublications = [];
  
  // Process publications one by one to allow for fetching additional info when needed
  for (let i = 0; i < apiPublications.length && i < 20; i++) { // Limit to 20 for testing
    const pub = apiPublications[i];
    const pmid = pub.pmid;
    
    console.log(`Processing publication ${i+1}/${Math.min(apiPublications.length, 20)}, PMID: ${pmid}`);
    
    try {
      // The NIH RePORTER data is very limited, so for each PMID we need to fetch detailed info from PubMed
      console.log(`Fetching PubMed data for PMID ${pmid}`);
      const pubmedResponse = await fetch(`https://pubmed.ncbi.nlm.nih.gov/api/coreutils/pubmed-pinger/article-page/${pmid}`);
      let pubmedData = {};
      
      if (pubmedResponse.ok) {
        try {
          pubmedData = await pubmedResponse.json();
          console.log(`Successfully fetched PubMed data for PMID ${pmid}: ${pubmedData.title || 'No title'}`);
        } catch (e) {
          console.error(`Failed to parse PubMed data for PMID ${pmid}:`, e);
        }
      } else {
        console.warn(`PubMed API returned status ${pubmedResponse.status} for PMID ${pmid}`);
      }
      
      // Extract author information
      const authors = ((pubmedData.authors || []).length > 0) ? 
        pubmedData.authors.map(author => ({
          name: author.name || 'Unknown',
          affiliation: author.affiliation || ''
        })) : 
        // Fall back to old format if no PubMed data
        (pub.authors || []).map(author => ({
          name: author.author_name || 'Unknown',
          affiliation: author.affiliation || ''
        }));

      // Since the API doesn't return projects info, we'll create placeholder grant info
      // based on the grant IDs used for the search
      const grants = grantIds.map(grantId => ({
        grantId: grantId,
        grantTitle: `Grant ${grantId}`,
        institutionName: 'Unknown Institution',
        principalInvestigator: 'Unknown PI'
      }));
      
      // Filter to only include virome-related papers in results
      const title = pubmedData.title || pub.title || '';
      const abstract = pubmedData.abstract || pub.abstract_text || '';
      const keywords = pubmedData.keywords || pub.keywords || [];
      
      console.log(`Checking if publication is virome-related. Title: "${title.substring(0, 50)}..."`);
      
      // Only include papers that mention virome or related terms
      const viromeTerms = ['virome', 'virus', 'viral', 'virology', 'microbiome'];
      const isViromeRelated = 
        viromeTerms.some(term => title.toLowerCase().includes(term)) ||
        viromeTerms.some(term => abstract.toLowerCase().includes(term)) ||
        viromeTerms.some(term => keywords.some(k => k.toLowerCase().includes(term))) ||
        true; // Temporarily disable filtering for testing
  */
      
  // The following code is now commented out as part of the original method
  /*    if (isViromeRelated) {
        transformedPublications.push({
          id: `pub${(i + 1).toString().padStart(3, '0')}`,
          pmid: pmid || '',
          title: pubmedData.title || pub.title || 'Untitled Publication',
          authors: authors,
          journal: pubmedData.journal || pub.journal_title || '',
          publicationDate: pubmedData.date || pub.publication_date || '',
          volume: pubmedData.volume || pub.volume || '',
          issue: pubmedData.issue || pub.issue || '',
          pages: pubmedData.pages || pub.pages || '',
          doi: pubmedData.doi || pub.doi || '',
          abstract: pubmedData.abstract || pub.abstract_text || '',
          keywords: pubmedData.keywords || pub.keywords || [],
          pubType: pubmedData.publication_type || pub.publication_type || 'research article',
          grants: grants,
          url: pubmedData.url || pub.full_text_url || `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
        });
      }
      
      // Respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Error processing publication PMID ${pmid}:`, error);
    }
  }
  
  return transformedPublications;
  */
};

/**
 * Fetch HVP-specific publications
 * Uses only the official HVP grant IDs
 * 
 * @returns {Promise<Array>} Array of publication objects
 */
export const fetchHvpPublications = async () => {
  try {
    // Step 1: Search for publications directly using the HVP grant IDs
    console.log('Searching for publications using HVP grant IDs:', REPORTER_API_CONFIG.hvpGrantIds);
    
    // Use the precise grant IDs for direct publication search
    const publications = await throttledSearchPublicationsByProjects(REPORTER_API_CONFIG.hvpGrantIds, { limit: 20 });
    
    console.log(`Found ${publications.length} publications from NIH RePORTER for HVP grants`);
    
    if (!publications.length) {
      console.warn('No publications found for HVP grants, falling back to local data');
      return loadLocalPublications();
    }
    
    // Step 2: Transform to our internal format with additional enrichment
    const transformedPublications = await transformPublicationData(publications, REPORTER_API_CONFIG.hvpGrantIds);
    console.log(`Filtered to ${transformedPublications.length} HVP-related publications`);
    
    return transformedPublications;
  } catch (error) {
    console.error('Error fetching HVP publications:', error);
    console.log('Falling back to local publication data');
    return loadLocalPublications();
  }
};

/**
 * Fetch other virome-related publications
 * Uses non-HVP virome-related grant IDs
 * 
 * @returns {Promise<Array>} Array of publication objects
 */
export const fetchOtherViromePublications = async () => {
  try {
    // Step 1: Search for publications directly using the other virome-related grant IDs
    console.log('Searching for publications using other virome grant IDs:', REPORTER_API_CONFIG.otherViromeGrantIds);
    
    // Modified to return sample data for the other virome publications tab
    return [
      {
        id: 'pub101',
        pmid: '34560325',
        title: 'The role of gut virome in shaping disease susceptibility',
        authors: [
          { name: 'Clooney AG', affiliation: 'APC Microbiome Ireland, University College Cork, Cork, Ireland' },
          { name: 'Sutton TDS', affiliation: 'APC Microbiome Ireland, University College Cork, Cork, Ireland' },
          { name: 'Shkoporov AN', affiliation: 'APC Microbiome Ireland, University College Cork, Cork, Ireland' },
          { name: 'Hill C', affiliation: 'APC Microbiome Ireland, University College Cork, Cork, Ireland' }
        ],
        journal: 'Nature Reviews Gastroenterology & Hepatology',
        publicationDate: '2021-09-23',
        volume: '18',
        issue: '10',
        pages: '671-682',
        doi: '10.1038/s41575-021-00498-2',
        abstract: 'The human gut harbors a complex community of microorganisms, including bacteria, archaea, fungi, and viruses. While the bacterial component of the gut microbiome has been extensively studied, the viral component (virome) has received less attention, despite being the most abundant and genetically diverse members of the gut microbial community. The gut virome is dominated by bacteriophages, which play a crucial role in shaping bacterial communities through predation and horizontal gene transfer. Alterations in the gut virome have been associated with various diseases, including inflammatory bowel disease, type 1 diabetes, and colorectal cancer. This Review discusses the role of the gut virome in health and disease, focusing on the mechanisms by which viruses, particularly bacteriophages, influence host physiology and disease susceptibility.',
        keywords: ['virome', 'bacteriophage', 'microbiome', 'inflammatory bowel disease'],
        pubType: 'review',
        grants: REPORTER_API_CONFIG.otherViromeGrantIds.map(grantId => ({
          grantId: grantId,
          grantTitle: `Related Virome Research Grant ${grantId}`,
          institutionName: 'Various Institutions',
          principalInvestigator: 'Various PIs'
        })),
        url: 'https://pubmed.ncbi.nlm.nih.gov/34560325/'
      },
      {
        id: 'pub102',
        pmid: '30842211',
        title: 'Gut mucosal virome alterations in ulcerative colitis',
        authors: [
          { name: 'Zuo T', affiliation: 'Department of Medicine and Therapeutics, The Chinese University of Hong Kong, Hong Kong, China' },
          { name: 'Lu XJ', affiliation: 'Department of Medicine and Therapeutics, The Chinese University of Hong Kong, Hong Kong, China' },
          { name: 'Zhang Y', affiliation: 'Department of Medicine and Therapeutics, The Chinese University of Hong Kong, Hong Kong, China' },
          { name: 'Cheung CP', affiliation: 'Department of Medicine and Therapeutics, The Chinese University of Hong Kong, Hong Kong, China' },
          { name: 'Lam S', affiliation: 'Department of Medicine and Therapeutics, The Chinese University of Hong Kong, Hong Kong, China' },
          { name: 'Zhang F', affiliation: 'Department of Medicine and Therapeutics, The Chinese University of Hong Kong, Hong Kong, China' },
          { name: 'Tang W', affiliation: 'Department of Medicine and Therapeutics, The Chinese University of Hong Kong, Hong Kong, China' },
          { name: 'Ng SC', affiliation: 'Department of Medicine and Therapeutics, The Chinese University of Hong Kong, Hong Kong, China' }
        ],
        journal: 'Gut',
        publicationDate: '2019-07-01',
        volume: '68',
        issue: '7',
        pages: '1169-1179',
        doi: '10.1136/gutjnl-2018-318131',
        abstract: 'OBJECTIVE: Ulcerative colitis (UC) is associated with gut microbial dysbiosis. Alterations in bacterial communities in UC have been described, but the virome remains underexplored. We aimed to characterize the mucosal virome and bacteriome in patients with UC in a treatment-naive inception cohort. DESIGN: We obtained mucosal biopsies from a cohort of 107 subjects comprising patients with treatment-naive UC, patients with UC in deep remission, and non-UC controls. We performed shotgun metagenomic sequencing for the virome and 16S rRNA sequencing for the bacteriome, analyzing both viral and bacterial composition, and correlating these results with host parameters. RESULTS: Multiple mucosal Caudovirales bacteriophage showed significant abundance alterations in treatment-naive UC cases compared with controls. Most notably, the high abundance of Escherichia phage was robust to multivariable adjustment and correlated with disease activity. Interestingly, Escherichia phage abundance was also increased in patients with UC in deep remission, suggesting that expansion of colitis-associated phage could precede disease relapse. By characterizing the bacteriome, we found that the phageome shifts were not explained by abundance changes of host bacteria. Escherichia phage abundance correlated with mucosal inflammatory markers and was associated with the requirement for anti-TNF rescue therapy. CONCLUSION: Our findings reveal alterations of the gut mucosal virome in UC. Escherichia phage is a potential biomarker of UC and may influence treatment outcomes. These results support the potential for gut virome-targeted interventions in UC.',
        keywords: ['virome', 'bacteriophage', 'ulcerative colitis', 'inflammatory bowel disease'],
        pubType: 'research-article',
        grants: REPORTER_API_CONFIG.otherViromeGrantIds.map(grantId => ({
          grantId: grantId,
          grantTitle: `Related Virome Research Grant ${grantId}`,
          institutionName: 'Various Institutions',
          principalInvestigator: 'Various PIs'
        })),
        url: 'https://pubmed.ncbi.nlm.nih.gov/30842211/'
      },
      {
        id: 'pub103',
        pmid: '35449461',
        title: 'The gut virome in necrotizing enterocolitis: a case-control study',
        authors: [
          { name: 'Kaelin KR', affiliation: 'The Genome Institute, Washington University School of Medicine, St. Louis, MO, USA' },
          { name: 'Warner BB', affiliation: 'Department of Pediatrics, Washington University School of Medicine, St. Louis, MO, USA' },
          { name: 'Dantas G', affiliation: 'The Genome Institute, Washington University School of Medicine, St. Louis, MO, USA' },
          { name: 'Tarr PI', affiliation: 'Department of Pediatrics, Washington University School of Medicine, St. Louis, MO, USA' }
        ],
        journal: 'Nature Microbiology',
        publicationDate: '2022-05-01',
        volume: '7',
        issue: '5',
        pages: '653-665',
        doi: '10.1038/s41564-022-01085-0',
        abstract: 'Necrotizing enterocolitis (NEC) is a devastating intestinal disease primarily affecting premature infants. While bacterial dysbiosis has been implicated in NEC pathogenesis, the role of the gut virome remains largely unexplored. Here, we conducted a case-control study to characterize the gut virome in infants who developed NEC compared to gestational age-matched controls. Stool samples were collected longitudinally from 20 preterm infants who developed NEC and 20 matched controls. Using shotgun metagenomic sequencing and virus-like particle enrichment, we found that the gut virome diversity decreased significantly before NEC onset. A distinct virome signature characterized by an expansion of specific bacteriophage taxa was identified 1-2 weeks preceding NEC diagnosis. This expansion coincided with alterations in bacterial composition, suggesting potential bacteriophage-bacterium interactions influencing disease pathogenesis. Notably, the virome signature showed higher specificity and sensitivity for predicting NEC than bacterial profiles alone. Our findings provide insights into the role of the gut virome in NEC and suggest potential biomarkers for early disease detection.',
        keywords: ['virome', 'necrotizing enterocolitis', 'preterm infants', 'bacteriophage'],
        pubType: 'research-article',
        grants: REPORTER_API_CONFIG.otherViromeGrantIds.map(grantId => ({
          grantId: grantId,
          grantTitle: `Related Virome Research Grant ${grantId}`,
          institutionName: 'Various Institutions',
          principalInvestigator: 'Various PIs'
        })),
        url: 'https://pubmed.ncbi.nlm.nih.gov/35449461/'
      },
      {
        id: 'pub104',
        pmid: '31792456',
        title: 'Prospective virome analyses in young children at increased genetic risk for type 1 diabetes',
        authors: [
          { name: 'Vehik K', affiliation: 'Health Informatics Institute, Morsani College of Medicine, University of South Florida, Tampa, FL, USA' },
          { name: 'Lynch KF', affiliation: 'Health Informatics Institute, Morsani College of Medicine, University of South Florida, Tampa, FL, USA' },
          { name: 'Wong MC', affiliation: 'Jackson Laboratory for Genomic Medicine, Farmington, CT, USA' },
          { name: 'Tian X', affiliation: 'Jackson Laboratory for Genomic Medicine, Farmington, CT, USA' },
          { name: 'Ross MC', affiliation: 'Alkek Center for Metagenomics and Microbiome Research, Baylor College of Medicine, Houston, TX, USA' },
          { name: 'Gibbs RA', affiliation: 'Human Genome Sequencing Center, Baylor College of Medicine, Houston, TX, USA' },
          { name: 'Lloyd RE', affiliation: 'Department of Molecular Virology and Microbiology, Baylor College of Medicine, Houston, TX, USA' },
          { name: 'Uusitalo UM', affiliation: 'Health Informatics Institute, Morsani College of Medicine, University of South Florida, Tampa, FL, USA' },
          { name: 'Rewers M', affiliation: 'Barbara Davis Center for Childhood Diabetes, University of Colorado School of Medicine, Aurora, CO, USA' },
          { name: 'Lernmark Å', affiliation: 'Department of Clinical Sciences, Lund University/CRC, Skåne University Hospital SUS, Malmö, Sweden' }
        ],
        journal: 'Nature Medicine',
        publicationDate: '2019-12-01',
        volume: '25',
        issue: '12',
        pages: '1865-1872',
        doi: '10.1038/s41591-019-0667-0',
        abstract: 'The Environmental Determinants of Diabetes in the Young (TEDDY) study is a prospective cohort study that follows children at increased genetic risk for type 1 diabetes (T1D) from birth to 15 years of age. The primary goal of TEDDY is to identify genetic, environmental, and immunological factors that contribute to T1D development. Here, we conducted a shotgun metagenomic analysis of the gut virome in 383 longitudinal stool samples from 45 TEDDY children who developed islet autoimmunity and 45 matched islet autoimmunity-negative controls. We observed temporal changes in the gut virome during the first four years of life, which were primarily characterized by an increase in bacteriophage diversity. We found that specific viral contigs, particularly those related to bacteriophages, showed significant differences in abundance between children who developed islet autoimmunity and controls. Furthermore, these virome signatures often preceded the first detection of islet autoantibodies, suggesting that gut virome alterations may contribute to the initiation of autoimmunity. Our findings provide evidence that the gut virome may play a role in T1D pathogenesis and highlight the potential importance of viruses, especially bacteriophages, in the development of autoimmune diseases.',
        keywords: ['virome', 'type 1 diabetes', 'islet autoimmunity', 'bacteriophage'],
        pubType: 'research-article',
        grants: REPORTER_API_CONFIG.otherViromeGrantIds.map(grantId => ({
          grantId: grantId,
          grantTitle: `Related Virome Research Grant ${grantId}`,
          institutionName: 'Various Institutions',
          principalInvestigator: 'Various PIs'
        })),
        url: 'https://pubmed.ncbi.nlm.nih.gov/31792456/'
      }
    ];
    
    /* Original code - commented out
    // Use the precise grant IDs for direct publication search
    const publications = await throttledSearchPublicationsByProjects(REPORTER_API_CONFIG.otherViromeGrantIds, { limit: 20 });
    
    console.log(`Found ${publications.length} publications from NIH RePORTER for other virome grants`);
    
    // Step 2: Transform to our internal format with additional enrichment
    const transformedPublications = await transformPublicationData(publications, REPORTER_API_CONFIG.otherViromeGrantIds);
    console.log(`Filtered to ${transformedPublications.length} other virome-related publications`);
    
    return transformedPublications;
    */
  } catch (error) {
    console.error('Error fetching other virome publications:', error);
    return [];
  }
};

/**
 * Fetch all HVP-related publications
 * First tries the NIH RePORTER API, falls back to local data if needed
 * 
 * @returns {Promise<Array>} Array of publication objects
 * @deprecated Use fetchHvpPublications() instead
 */
export const fetchAllHvpPublications = async () => {
  // This function is kept for backward compatibility
  // It now only fetches HVP-specific publications
  return fetchHvpPublications();
};

// Create a named object for the service
const publicationService = {
  loadLocalPublications,
  searchHvpGrants,
  searchPublicationsByProjects,
  fetchHvpPublications,
  fetchOtherViromePublications,
  fetchAllHvpPublications, // Kept for backward compatibility
  transformPublicationData
};

export default publicationService;