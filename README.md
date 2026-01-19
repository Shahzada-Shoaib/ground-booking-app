# Ground Booking App

A modern, scalable cricket ground booking application built with Next.js.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

For production deployment, you need to set the `NEXT_PUBLIC_BASE_URL` environment variable to your production URL. This ensures that booking URLs are generated correctly and CORS issues are avoided.

### Development
No environment variables needed. The app will automatically use `http://localhost:3000`.

### Production

Create a `.env.local` file (or set environment variables in your hosting platform):

```bash
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

**Important:** 
- Replace `https://your-domain.com` with your actual production URL
- Do NOT include a trailing slash
- The URL should be the full domain (e.g., `https://ground-booking.vercel.app`)

### Examples:
```bash
# Vercel deployment
NEXT_PUBLIC_BASE_URL=https://ground-booking.vercel.app

# Custom domain
NEXT_PUBLIC_BASE_URL=https://booking.yourdomain.com
```

## Deployment

### Deploy on Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com/new)
3. **Add Environment Variable:**
   - Go to Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_BASE_URL` with your production URL
   - Example: `https://your-project.vercel.app`
4. Deploy!

### Deploy on Other Platforms

1. Set the `NEXT_PUBLIC_BASE_URL` environment variable to your production URL
2. Build the project: `npm run build`
3. Start the production server: `npm start`

## Features

- ✅ Scalable URL generation with environment variable support
- ✅ CORS configuration for production
- ✅ Client and server-side rendering support
- ✅ Responsive design
- ✅ Booking management
- ✅ Analytics and reporting

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
