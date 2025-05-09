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
    // Return hardcoded sample data as absolute fallback
    console.log('Using hardcoded sample publication data as fallback');
    return SAMPLE_PUBLICATIONS;
  }
};

// Hardcoded sample publications as absolute fallback
const SAMPLE_PUBLICATIONS = [
  {
    "id": "pub001",
    "pmid": "35961143",
    "title": "The human virome: assembly, composition and host interactions",
    "authors": [
      {
        "name": "Gregory JK",
        "affiliation": "Departments of Biology and Chemistry, Massachusetts Institute of Technology, Cambridge, MA, USA"
      },
      {
        "name": "Twork MD",
        "affiliation": "Departments of Biology and Chemistry, Massachusetts Institute of Technology, Cambridge, MA, USA"
      }
    ],
    "journal": "Nature Reviews Microbiology",
    "publicationDate": "2022-09-07",
    "volume": "20",
    "issue": "11",
    "pages": "693-704",
    "doi": "10.1038/s41579-022-00767-0",
    "abstract": "The human virome represents the collection of all viruses that are found in or on humans, including viruses causing acute, persistent or latent infection, as well as viruses integrated into the human genome. Advances in metagenomic sequencing have enabled detailed cataloguing of the virome in many human tissues.",
    "keywords": ["virome", "metagenomics", "microbiome", "host-virus interactions"],
    "pubType": "research article",
    "grants": [
      {
        "grantId": "U54AG089335",
        "grantTitle": "Human Virome Characterization Center for the Oral-Gut-Brain Axis",
        "institutionName": "UCLA",
        "principalInvestigator": "Kapila Y"
      }
    ],
    "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9529780/"
  },
  {
    "id": "pub002",
    "pmid": "33941705",
    "title": "Expanding the human virome using capture sequencing",
    "authors": [
      {
        "name": "Metsky HC",
        "affiliation": "Broad Institute of MIT and Harvard, Cambridge, MA, USA"
      },
      {
        "name": "Sabeti PC",
        "affiliation": "Harvard T.H. Chan School of Public Health, Boston, MA, USA"
      }
    ],
    "journal": "Cell",
    "publicationDate": "2021-05-13",
    "volume": "184",
    "issue": "10",
    "pages": "2604-2618",
    "doi": "10.1016/j.cell.2021.04.010",
    "abstract": "The detection and characterization of viruses present in humans is fundamental to understanding their roles in health and disease. Metagenomic next-generation sequencing is being rapidly adopted for the discovery and detection of viruses.",
    "keywords": ["virome", "metagenomics", "viral discovery", "capture sequencing"],
    "pubType": "research article",
    "grants": [
      {
        "grantId": "U54AG089325",
        "grantTitle": "Virome in diverse populations",
        "institutionName": "Broad/BWH",
        "principalInvestigator": "Sabeti P"
      }
    ],
    "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8107160/"
  },
  {
    "id": "pub003",
    "pmid": "34244690",
    "title": "Shotgun Transcriptome and Isothermal Profiling of SARS-CoV-2 Infection Reveals Unique Host Responses",
    "authors": [
      {
        "name": "Parker MD",
        "affiliation": "Sheffield Biomedical Research Centre, University of Sheffield, Sheffield, UK"
      }
    ],
    "journal": "Nature Communications",
    "publicationDate": "2021-07-14",
    "volume": "12",
    "issue": "1",
    "pages": "4196",
    "doi": "10.1038/s41467-021-24349-5",
    "abstract": "The severe acute respiratory syndrome coronavirus 2 (SARS-CoV-2) pandemic has caused global disruption, but rapid viral genome sequencing and global public data sharing have enabled phylogenetic analysis and comparative genomics from early in the pandemic.",
    "keywords": ["SARS-CoV-2", "COVID-19", "viral sequencing", "host response"],
    "pubType": "research article",
    "grants": [
      {
        "grantId": "AT012993",
        "grantTitle": "Deep tissue virome characterization",
        "institutionName": "UCSF",
        "principalInvestigator": "Henrich T"
      }
    ],
    "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8269505/"
  }
];

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
 * @returns {Array} Transformed publications in our internal format
 */
export const transformPublicationData = (apiPublications = []) => {
  return apiPublications.map((pub, index) => {
    // Extract author information
    const authors = (pub.authors || []).map(author => ({
      name: author.author_name || 'Unknown',
      affiliation: author.affiliation || ''
    }));

    // Extract grant information
    const grants = (pub.projects || []).map(project => ({
      grantId: project.project_num || '',
      grantTitle: project.project_title || '',
      institutionName: project.organization_name || '',
      principalInvestigator: project.contact_pi_name || ''
    }));

    return {
      id: `pub${(index + 1).toString().padStart(3, '0')}`,
      pmid: pub.pmid || '',
      title: pub.title || 'Untitled Publication',
      authors: authors,
      journal: pub.journal_title || '',
      publicationDate: pub.publication_date || '',
      volume: pub.volume || '',
      issue: pub.issue || '',
      pages: pub.pages || '',
      doi: pub.doi || '',
      abstract: pub.abstract_text || '',
      keywords: (pub.keywords || []),
      pubType: pub.publication_type || 'unknown',
      grants: grants,
      url: pub.full_text_url || `https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`
    };
  });
};

/**
 * Fetch all HVP-related publications
 * First tries the NIH RePORTER API, falls back to local data if needed
 * 
 * @returns {Promise<Array>} Array of publication objects
 */
export const fetchAllHvpPublications = async () => {
  try {
    // Step 1: Get all HVP-related grants
    const grants = await throttledSearchHvpGrants({ limit: 100 });
    
    if (!grants.length) {
      console.warn('No HVP grants found, falling back to local data');
      return loadLocalPublications();
    }
    
    // Step 2: Extract project IDs from grants
    const projectIds = grants.map(grant => grant.project_num);
    
    // Step 3: Get publications for these projects
    const publications = await throttledSearchPublicationsByProjects(projectIds, { limit: 200 });
    
    if (!publications.length) {
      console.warn('No publications found for HVP grants, falling back to local data');
      return loadLocalPublications();
    }
    
    // Step 4: Transform to our internal format
    return transformPublicationData(publications);
  } catch (error) {
    console.error('Error fetching HVP publications:', error);
    console.log('Falling back to local publication data');
    return loadLocalPublications();
  }
};

// Create a named object for the service
const publicationService = {
  loadLocalPublications,
  searchHvpGrants,
  searchPublicationsByProjects,
  fetchAllHvpPublications,
  transformPublicationData
};

export default publicationService;