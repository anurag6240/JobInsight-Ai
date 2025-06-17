# 🚀 **JobInsight+** – *AI-Powered Career Intelligence Platform*

<p align="center">
  <img src="public/assest/banner.png" alt="JobInsight+ Banner" width="70%" />
</p>



**JobInsight+** is an AI-driven career assistant platform that helps job seekers analyze their resumes against job descriptions, identify skill gaps, and receive personalized recommendations for continuous growth.

---

## ✨ **Key Features**

### 📄 Smart Resume Analysis
- 🧠 Upload your resume (PDF/text) for instant analysis
- 🔍 Extract insights about your skills, experience, and education
- 🧭 Identify areas for growth and optimization

### 🧠 Job Matching Intelligence
- 🔗 Import job descriptions via URL or paste text directly
- 📊 Perform detailed skill gap analysis
- ✅ View a match percentage between your resume and the job role

### 📈 Career Trend Insights
- 🔍 Discover in-demand skills and technologies in your domain
- 🛰 Stay updated with real-time industry trends
- 📡 Get alerts about emerging tools and frameworks

### 🤖 AI-Powered Recommendations
- 🛣 Get personalized learning paths and certifications
- 🎯 Targeted suggestions to bridge specific skill gaps
- 🧩 Tailored resources based on your career path


---

## ⚙️ **Getting Started**

### ✅ Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- `npm` or `yarn`
- A modern web browser

### 📦 Installation

```bash
# Clone the repository
git clone https://github.com/zeusgodyt/Insight-.git
cd jobinsight-plus

# Install dependencies
npm install   # or yarn install

```

### 🔧 Environment Setup

1. Create a `.env.local` file in the root directory for local development:
```bash
# Gemini AI API Key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server Configuration
VITE_HOST=::
VITE_PORT=8080
```

2. Create a `.env.production` file for production deployment:
```bash
# Gemini AI API Key
VITE_GEMINI_API_KEY=your_production_gemini_api_key

# Supabase Configuration
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key

# Server Configuration
VITE_HOST=0.0.0.0
VITE_PORT=80
```

### 🚀 Deployment

#### Vercel Deployment

1. **Prerequisites**
   - A [Vercel](https://vercel.com) account
   - Vercel CLI installed (`npm i -g vercel`)

2. **Environment Variables Setup in Vercel**
   - Go to your project settings in Vercel dashboard
   - Navigate to the "Environment Variables" section
   - Add the following environment variables:
     ```
     VITE_GEMINI_API_KEY=your_gemini_api_key
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Deploy to Vercel**
   ```bash
   # Login to Vercel
   vercel login

   # Deploy to Vercel
   vercel
   
   # For production deployment
   vercel --prod
   ```

   Alternatively, you can deploy directly from GitHub:
   1. Push your code to GitHub
   2. Import your repository in Vercel
   3. Configure the environment variables
   4. Deploy

4. **Vercel CLI Commands**
   ```bash
   # Preview deployment
   vercel

   # Production deployment
   vercel --prod

   # List deployments
   vercel ls

   # Remove deployment
   vercel remove [deployment-url]
   ```

#### Manual Deployment

1. **Build the Production Version**
```bash
npm run build:prod
```

2. **Preview the Production Build**
```bash
npm run preview
```

3. **Start the Production Server**
```bash
npm run start
```

### 🛠️ Development

```bash
# Start development server
npm run dev

# Build for development
npm run build:dev

# Lint code
npm run lint
```

### 📝 Environment Variables

- `VITE_GEMINI_API_KEY`: Your Google Gemini AI API key
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_HOST`: Server host (default: "::" for development, "0.0.0.0" for production)
- `VITE_PORT`: Server port (default: 8080 for development, 80 for production)

### 🔒 Security Notes

1. Never commit `.env.local` or `.env.production` files to version control
2. Keep your API keys and secrets secure
3. Use different API keys for development and production environments
4. Regularly rotate your API keys and secrets

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
