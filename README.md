<p align="center">
  <img src="hvp_hex_logo.png" alt="HVP Dashboard Logo" width="200" />
</p>

# NIH Human Virome Program Dashboard

An interactive dashboard visualizing data from the NIH Human Virome Program (HVP).

## Project Overview

This dashboard provides visualization and exploration of data from the NIH Human Virome Program, including:
- Project distribution and status
- Sample demographics and metrics
- Geographic distribution of research
- Scientific impact and research focus

The dashboard is hosted using GitHub Pages at: https://shandley.github.io/hvp-project-dashboard/

## Development

This project is built with:
- React.js for the UI framework
- D3.js and Chart.js for visualizations
- GitHub Pages for hosting

### Local Development

To run the project locally:

1. Clone the repository
```
git clone https://github.com/shandley/hvp-project-dashboard.git
cd hvp-project-dashboard
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm start
```

4. Open your browser to http://localhost:3000

### Building for Production

To build the project for GitHub Pages:
```
npm run build
```

This will create optimized production files in the `build` directory.

## Data Sources

The dashboard is based on the following data sources:
- `HVP_master.csv`: Primary data table of HVP projects
- `additional-hvp-data.md`: Supplementary contextual information

## Implementation Plan

For details on the implementation strategy, see the [GitHub Pages Implementation Plan](github_pages_implementation_plan.md).

## License

[MIT License](LICENSE)