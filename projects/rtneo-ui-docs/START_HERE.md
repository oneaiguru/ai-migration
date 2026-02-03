# ✅ Quick Start Checklist

## For You (Non-technical User)

### Jury Demo Runbook
- See `JURY_DEMO_RUNBOOK.md` for the step-by-step demo flow (data cutoff, fact vs forecast, CSV export).

### What You Have Now
- [ ] Downloaded `forecast-ui.zip` (or have files in directory)
- [ ] Read `SUMMARY.md` to understand deliverables
- [ ] Reviewed `VISUAL_GUIDE.md` to see what UI looks like

### Next Steps
1. [ ] Forward `forecast-ui/` directory to your developer
2. [ ] Share `DEPLOYMENT_GUIDE.md` with them
3. [ ] Ask them to deploy and send you live URL
4. [ ] Test the prototype at the URL they provide
5. [ ] Provide feedback on what needs to change

---

## For Developer (Claude Code Agent or Human)

### Setup (5-10 minutes)

```bash
# 1. Navigate to project
cd forecast-ui

# 2. Install dependencies (takes ~2 minutes)
npm install

# 3. Verify installation worked
npm run dev
```

✅ If you see "Local: http://localhost:3000" → success!  
❌ If errors → check Node.js version (need 18+)

### Local Testing (5 minutes)

Open http://localhost:3000 and verify:
- [ ] Sidebar menu appears on left
- [ ] Top tabs (Обзор, Районы, Площадки, Маршруты) work
- [ ] Overview tab shows 2 bar charts
- [ ] Districts tab shows table with 10 rows
- [ ] Sites tab shows table with 8 sites
- [ ] Routes tab shows 2 columns (strict vs showcase)
- [ ] All tables are scrollable
- [ ] Filters on Sites tab work

### Git Setup (5 minutes)

```bash
# 1. Initialize repo
git init
git add .
git commit -m "Initial commit: MyTKO Forecast UI"

# 2. Create GitHub repo (on github.com)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/mytko-forecast-ui.git
git branch -M main
git push -u origin main
```

### Vercel Deployment (10 minutes)

#### Option A: Via Dashboard (Easier)
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repo
5. Settings should auto-detect:
   - Framework: Vite ✅
   - Build Command: `npm run build` ✅
   - Output Directory: `dist` ✅
6. Click "Deploy"
7. Wait ~2 minutes
8. Get URL like: `https://mytko-forecast-ui.vercel.app`

#### Option B: Via CLI (Faster if you know CLI)
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Post-Deployment Checklist

After getting live URL, test:
- [ ] URL loads without errors
- [ ] All tabs work
- [ ] Charts render correctly
- [ ] Tables show data
- [ ] Responsive on mobile (open on phone)
- [ ] No console errors (open DevTools → Console)

### Share URL
- [ ] Send URL to stakeholders
- [ ] Add to project documentation
- [ ] (Optional) Set up custom domain in Vercel

---

## Troubleshooting

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 already in use"
```bash
# Kill the process
kill $(lsof -t -i:3000)
# Or use different port
npm run dev -- --port 3001
```

### Error: Vercel deployment failed
1. Check build logs in Vercel dashboard
2. Verify `package.json` scripts are correct
3. Ensure `vercel.json` is present
4. Try building locally first: `npm run build`

### Charts not showing
- Check browser console for errors
- Verify Recharts imported correctly
- Ensure data structure matches types

---

## Customization Guide

Want to make changes? See:
- `CODE_EXAMPLES.md` — 12 common modifications
- `TECHNICAL_OVERVIEW.md` — Architecture details
- `forecast-ui/README.md` — Full documentation

Common requests:
- Change colors → Edit `tailwind.config.js`
- Add new tab → See CODE_EXAMPLES.md #1
- Connect to API → See CODE_EXAMPLES.md #2
- Add date picker → See CODE_EXAMPLES.md #3
- Export to Excel → See CODE_EXAMPLES.md #5

---

## Timeline Estimates

| Task | Time |
|------|------|
| Setup + local test | 15 min |
| Git + GitHub | 5 min |
| Vercel deploy | 10 min |
| **Total to production** | **30 min** |
| Connect real API | 2-4 hours |
| Add authentication | 1-2 hours |
| Custom features | Varies |

---

## Support Contacts

If stuck:
1. Check `TECHNICAL_OVERVIEW.md` for architecture
2. Check `CODE_EXAMPLES.md` for common fixes
3. Read error messages carefully
4. Google the error (usually Stack Overflow has answer)
5. Ask in team chat

---

## Success Criteria ✅

You're done when:
- [ ] Live URL accessible from anywhere
- [ ] All 4 tabs work correctly
- [ ] Data displays properly
- [ ] Stakeholders can view and test
- [ ] URL shared with team
- [ ] (Optional) Custom domain set up

---

## What's Next?

After successful deployment:

### Phase 1 (Week 1-2)
- Collect feedback from users
- Fix any bugs found
- Adjust colors/styles per brand guidelines

### Phase 2 (Week 3-4)
- Connect to real API
- Replace mock data
- Add authentication

### Phase 3 (Month 2)
- Add requested features
- Optimize performance
- Set up monitoring

### Phase 4 (Month 3+)
- Integration with main MyTKO system
- Advanced features (maps, exports, etc.)
- Mobile app consideration

---

## Cost Summary

- Development: **Done** ✅ (already paid)
- Hosting (Vercel free tier): **$0/month**
- Domain (optional): **~$12/year**
- API costs: **TBD** (depends on usage)
- Maintenance: **Minimal** (static site)

**Total first year**: ~$12 for domain (or $0 if using vercel.app subdomain)

---

## Key Files Reference

```
forecast-ui/
├── README.md                 ← Start here (full docs)
├── package.json              ← Dependencies
├── src/
│   ├── App.tsx              ← Main app logic
│   ├── components/          ← All UI components
│   │   ├── Overview.tsx     ← Tab 1
│   │   ├── Districts.tsx    ← Tab 2
│   │   ├── Sites.tsx        ← Tab 3
│   │   └── Routes.tsx       ← Tab 4
│   └── data/metrics.ts      ← Data + types
└── vercel.json              ← Deployment config

docs/
├── SUMMARY.md               ← Executive overview
├── DEPLOYMENT_GUIDE.md      ← Step-by-step deploy
├── VISUAL_GUIDE.md          ← What UI looks like
├── TECHNICAL_OVERVIEW.md    ← Architecture
└── CODE_EXAMPLES.md         ← How to customize
```

---

**Status**: Ready to deploy 🚀  
**Estimated deploy time**: 30 minutes from start to live URL  
**Difficulty**: Easy (follow checklist step by step)

---

Good luck! 🎉
