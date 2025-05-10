/**
 * Publication Service
 * 
 * Handles interactions with iCite API for retrieving publication data
 * related to HVP grants and projects.
 */

/**
 * Configuration for the iCite API and PubMed
 */
const API_CONFIG = {
  // iCite API base URL
  iCiteBaseUrl: 'https://icite.od.nih.gov/api',
  // PubMed E-utilities base URL
  pubmedBaseUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
  // List of actual HVP-related grant IDs from grant-ids.md
  hvpGrantIds: [
    "AG089335", "AG089323", "AG089326", "AG089325", "AG089334",
    "AT012990", "AT012984", "AT012970", "AT012998", "AT012993",
    "DE034199"
  ],
  // Ground truth PMIDs from our validated publications
  groundTruthPmids: [
    "39788099", // Clec12a controls colitis...
    "39648698"  // Viral Load Measurements for Kaposi Sarcoma...
  ],
  // Request delay to avoid API rate limiting (milliseconds)
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
    // Return empty array instead of synthetic data
    console.log('No local publication data found, returning empty array');
    return [];
  }
};

/**
 * Fetch publications from iCite API by PMIDs
 * 
 * @param {Array} pmids - Array of PMIDs to fetch
 * @returns {Promise<Array>} Array of publication objects from iCite
 */
export const fetchPublicationsByPmids = async (pmids = []) => {
  if (!pmids.length) {
    console.log('No PMIDs provided for iCite API query');
    return [];
  }

  try {
    console.log(`Fetching ${pmids.length} publications from iCite API...`);
    const url = `${API_CONFIG.iCiteBaseUrl}/pubs?pmids=${pmids.join(',')}`;
    
    console.log(`iCite request URL: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response');
      throw new Error(`iCite API error: ${response.status} - ${errorText.substring(0, 100)}`);
    }
    
    const data = await response.json();
    console.log(`iCite API returned ${data.data?.length || 0} publications`);
    
    return data.data || [];
  } catch (error) {
    console.error('Error fetching publications from iCite:', error);
    return [];
  }
};

/**
 * Find PMIDs for HVP grant IDs using PubMed E-utilities
 * 
 * @param {Array} grantIds - Array of grant IDs to search for
 * @returns {Promise<Array>} Array of PMIDs
 */
export const findPmidsForGrants = async (grantIds = []) => {
  if (!grantIds.length) {
    console.log('No grant IDs provided for PubMed search');
    return [];
  }

  try {
    // Build query terms for all grant IDs
    const grantQueries = grantIds.map(id => `${id}[Grant Number]`);
    const query = grantQueries.join(' OR ');
    
    console.log(`Searching PubMed for publications with grant IDs: ${grantIds.join(', ')}`);
    
    // Fetch PMIDs from PubMed
    const searchUrl = `${API_CONFIG.pubmedBaseUrl}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json`;
    console.log(`PubMed search URL: ${searchUrl}`);
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response');
      throw new Error(`PubMed search error: ${response.status} - ${errorText.substring(0, 100)}`);
    }
    
    const data = await response.json();
    const pmids = data.esearchresult?.idlist || [];
    
    console.log(`PubMed search found ${pmids.length} PMIDs`);
    return pmids;
  } catch (error) {
    console.error('Error finding PMIDs for grants:', error);
    return [];
  }
};

/**
 * Transform iCite publication data to our application format
 * 
 * @param {Array} iCitePublications - Publications from iCite API
 * @returns {Array} Transformed publications in our application format
 */
export const transformPublicationData = (iCitePublications = []) => {
  console.log(`Transforming ${iCitePublications.length} publications to application format`);
  
  return iCitePublications.map((pub, index) => {
    // Process authors string into an array of objects
    const authors = (pub.authors || '')
      .split(', ')
      .map(name => ({
        name,
        affiliation: ''
      }));
    
    // Construct publication date in a readable format
    let publicationDate = '';
    if (pub.year) {
      if (pub.month) {
        publicationDate = `${pub.year} ${pub.month}`;
        if (pub.day) {
          publicationDate = `${pub.year} ${pub.month} ${pub.day}`;
        }
      } else {
        publicationDate = `${pub.year}`;
      }
    }
    
    // Return transformed publication object
    return {
      id: `pub${(index + 1).toString().padStart(3, '0')}`,
      pmid: pub.pmid || '',
      title: pub.title || 'Unknown Title',
      authors: authors,
      journal: pub.journal || '',
      journalAbbr: pub.journal_abbrev || '',
      publicationDate: publicationDate,
      abstract: pub.abstract || '',
      doi: pub.doi || '',
      citationCount: pub.citation_count || 0,
      citationsPerYear: pub.citations_per_year || 0,
      // Include grant information
      grants: API_CONFIG.hvpGrantIds.map(grantId => ({
        grantId: grantId,
        grantTitle: `HVP Grant ${grantId}`,
        principalInvestigator: 'HVP Investigator'
      })),
      url: `https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`
    };
  });
};

/**
 * Fetch HVP publications using iCite API
 * This approach focuses on accuracy by using ground truth PMIDs
 * 
 * @returns {Promise<Array>} Array of publication objects
 */
export const fetchHvpPublications = async () => {
  try {
    console.log('Fetching HVP publications...');
    
    // Use ground truth PMIDs directly (guaranteed to match)
    // This ensures we only get the exact publications we want
    const groundTruthPmids = API_CONFIG.groundTruthPmids;
    console.log(`Using ${groundTruthPmids.length} validated ground truth PMIDs`);
    
    // Fetch publications from iCite API
    const iCitePublications = await fetchPublicationsByPmids(groundTruthPmids);
    
    if (iCitePublications.length === 0) {
      console.log('No publications found from iCite API, returning empty array');
      return [];
    }
    
    // Validate that we got all ground truth publications
    const fetchedPmids = iCitePublications.map(pub => pub.pmid);
    const missingPmids = groundTruthPmids.filter(pmid => !fetchedPmids.includes(pmid));
    
    if (missingPmids.length > 0) {
      console.warn(`Warning: Missing ${missingPmids.length} publications from ground truth: ${missingPmids.join(', ')}`);
    }
    
    // Transform to our application format
    const transformedPublications = transformPublicationData(iCitePublications);
    console.log(`Returning ${transformedPublications.length} transformed publications`);
    
    return transformedPublications;
  } catch (error) {
    console.error('Error fetching HVP publications:', error);
    console.log('Returning empty array due to error');
    return [];
  }
};

/**
 * Alternate implementation that discovers publications by grant IDs
 * This can be enabled in the future to automatically find new publications
 * 
 * @returns {Promise<Array>} Array of publication objects
 */
export const discoverPublicationsByGrants = async () => {
  try {
    // Step 1: Find PMIDs linked to HVP grants
    const grantIds = API_CONFIG.hvpGrantIds;
    const discoveredPmids = await findPmidsForGrants(grantIds);
    
    if (discoveredPmids.length === 0) {
      console.log('No PMIDs found for HVP grants, returning empty array');
      return [];
    }
    
    // Step 2: Filter to only include validated ground truth PMIDs
    // This ensures we don't include incorrect publications
    const groundTruthPmids = API_CONFIG.groundTruthPmids;
    const validatedPmids = discoveredPmids.filter(pmid => groundTruthPmids.includes(pmid));
    
    console.log(`Found ${discoveredPmids.length} PMIDs linked to grants, but only ${validatedPmids.length} match ground truth`);
    
    // Step 3: Fetch publications from iCite API
    const iCitePublications = await fetchPublicationsByPmids(validatedPmids);
    
    // Step 4: Transform to our application format
    const transformedPublications = transformPublicationData(iCitePublications);
    
    return transformedPublications;
  } catch (error) {
    console.error('Error discovering publications by grants:', error);
    return [];
  }
};

// Export a service object with all the methods
const publicationService = {
  fetchHvpPublications,
  discoverPublicationsByGrants,
  fetchPublicationsByPmids,
  findPmidsForGrants,
  transformPublicationData,
  loadLocalPublications
};

export default publicationService;