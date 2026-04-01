# 🚀 Production Deployment & Migration Guide

**Timeline to Production:** 2-3 weeks with dedicated security team

---

## Phase 1: Critical Security Fixes (Week 1)

### Immediate Actions (Day 1)
- [ ] Remove all hardcoded credentials from `AuthContext.tsx`
- [ ] Apply production RLS policies to Supabase
- [ ] Remove API keys from Vite config
- [ ] Add Zod validation to all API endpoints
- [ ] Implement Winston logger
- [ ] Set strong JWT secrets (min 32 chars)
- [ ] Add helmet security headers
- [ ] Test CORS configuration

**Estimated Time:** 8-12 hours

### Implementation Tasks (Days 2-3)
- [ ] Replace all `console.log` with logger calls
- [ ] Implement rate limiting on auth endpoints
- [ ] Add input validation to all forms (frontend + backend)
- [ ] Test JSON parsing vulnerability fixes
- [ ] Implement CSRF token rotation
- [ ] Add audit logging for admin actions
- [ ] Configure email service for notifications

**Estimated Time:** 16-24 hours

### Testing (Day 4)
- [ ] Unit tests for auth flows
- [ ] Integration tests for API endpoints
- [ ] Security test: try SQL injection
- [ ] Security test: try XSS attacks
- [ ] Load testing (1000 concurrent users)
- [ ] Penetration testing

**Estimated Time:** 8 hours

---

## Phase 2: Admin Panel Development (Week 2)

### Backend APIs
```typescript
// Priority 1 (must have)
- GET /api/admin/users
- GET /api/admin/users/:id
- POST /api/admin/users/:id/ban
- POST /api/admin/users/:id/role
- GET /api/admin/dashboard
- GET /api/admin/audit-logs

// Priority 2 (should have)
- POST /api/admin/users/:id/credits
- POST /api/admin/payments/:id/refund
- PUT /api/admin/pricing/:planId
- GET /api/admin/analytics

// Priority 3 (nice to have)
- POST /api/admin/features/:id/toggle
- PUT /api/admin/config/maintenance
```

### Frontend Components
```typescript
- AdminDashboard.tsx (main dashboard)
- UserManagement.tsx (list, search, actions)
- UserDetailModal.tsx (detailed view)
- AnalyticsDashboard.tsx (charts)
- AuditLogs.tsx (action history)
- SystemSettings.tsx (config management)
- PaymentManagement.tsx (transactions)
```

**Estimated Time:** 40-60 hours

---

## Phase 3: Database & Infrastructure (Week 3)

### Database Setup
- [ ] Create production PostgreSQL instance
- [ ] Apply schema migrations
- [ ] enable Row Level Security
- [ ] Set up automated backups
- [ ] Configure connection pooling (PgBouncer)
- [ ] Create indexes for performance
- [ ] Test disaster recovery

### Infrastructure
- [ ] Set up Redis (caching + rate limiting)
- [ ] Configure CDN for static assets
- [ ] Set up SSL certificate
- [ ] Configure domain DNS
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Configure logging aggregation (ELK stack or CloudWatch)
- [ ] Set up uptime monitoring

### Email Setup
- [ ] Verify Resend API key
- [ ] Create email templates
- [ ] Set up bounce handling
- [ ] Test email deliverability
- [ ] Configure DNS records (SPF, DKIM, DMARC)

**Estimated Time:** 24-32 hours

---

## Environment Configuration

### Production `.env` File
```env
# Must be set for production
NODE_ENV=production
PORT=5000

# Frontend
CLIENT_URL=https://neotoons.ai
VITE_API_URL=https://api.neotoons.ai

# JWT & Security
JWT_SECRET=your-64-char-random-string-min-32-chars
ADMIN_SESSION_SECRET=another-64-char-random-secret
CSRF_SECRET=yet-another-64-char-secret

# Database
DATABASE_URL=postgresql://user:password@host:5432/neotoons
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://user:password@host:6379

# Email
RESEND_API_KEY=re_prod_your_actual_key
APP_EMAIL=noreply@neotoons.ai
ADMIN_EMAIL=admin@neotoons.ai

# AI Providers (backend only - never expose these!)
OPENROUTER_API_KEY=sk-or-prod-your-key
HUGGINGFACE_API_KEY=hf_prod_your_key

# Admin Configuration
ADMIN_EMAIL=admin@neotoons.ai,owner@neotoons.ai
CLERK_ADMIN_EMAILS=admin@neotoons.ai,owner@neotoons.ai

# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Logging
LOG_LEVEL=info
SENTRY_DSN=https://...

# Security
ALLOWED_ORIGINS=https://neotoons.ai,https://www.neotoons.ai
```

**⚠️ CRITICAL:** Never commit `.env.production` to git. Use environment secrets (GitHub Secrets, AWS Secrets Manager, etc.)

---

## Database Migration

### From Development to Production

```sql
-- 1. Dump development data (if keeping)
pg_dump -h localhost development_db > backup.sql

-- 2. Connect to production database
psql 'postgresql://user:password@prod-host:5432/neotoons'

-- 3. Run schema
\i supabase/schema.sql

-- 4. Apply RLS policies
-- (See SECURITY_AUDIT_COMPREHENSIVE.md for full RLS policies)

-- 5. Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- 6. Verify data integrity
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM messages;
```

---

## Security Verification Checklist

### Authentication & Authorization
- [ ] JWT tokens have 15-minute expiry (not 24h)
- [ ] Refresh tokens implemented for extended sessions
- [ ] Password hashing uses bcrypt with 12+ rounds
- [ ] Password reset tokens are single-use and time-limited
- [ ] Admin API endpoints require authentication + authorization
- [ ] Sessions are invalidated on logout
- [ ] 2FA enabled for admin accounts
- [ ] OAuth properly configured (if using)

### Database Security
- [ ] RLS policies enforced and tested
- [ ] No world-readable data
- [ ] Foreign key constraints enabled
- [ ] Encryption at rest enabled
- [ ] Backup encryption configured
- [ ] Audit logs enabled
- [ ] Old data cleanup scheduled

### API Security
- [ ] All inputs validated with Zod
- [ ] Rate limiting on all public endpoints
- [ ] CORS properly configured
- [ ] CSRF tokens required for mutations
- [ ] Security headers (helmet) enabled
- [ ] SQL injection tested and prevented
- [ ] XSS protection enabled
- [ ] API documentation updated
- [ ] No sensitive data in logs

### Frontend Security
- [ ] API keys NOT in bundle
- [ ] Environment variables not exposed
- [ ] Content Security Policy set
- [ ] Secure cookies configured
- [ ] SameSite cookie attribute set
- [ ] HttpOnly flag on session cookies
- [ ] Error messages don't leak info
- [ ] Dependency vulnerabilities scanned

### Infrastructure
- [ ] SSL/TLS certificate valid
- [ ] HTTPS enforced (redirect HTTP)
- [ ] Firewall rules configured
- [ ] DDoS protection enabled
- [ ] WAF (Web Application Firewall) configured
- [ ] Load balancer health checks working
- [ ] Database backups automated
- [ ] Log retention policy set
- [ ] Monitoring/alerting active

---

## Performance Optimization Checklist

### Frontend
- [ ] Bundle size < 500KB (gzipped)
- [ ] Code splitting enabled
- [ ] Images optimized and lazy-loaded
- [ ] CSS is minified
- [ ] JavaScript is minified and tree-shaken
- [ ] Service worker implemented (PWA)
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s

### Backend
- [ ] Database queries optimized (no N+1)
- [ ] Indexes created on frequently queried fields
- [ ] Connection pooling configured
- [ ] Caching strategy implemented (Redis)
- [ ] Response times < 200ms (p95)
- [ ] Streaming responses for large data
- [ ] Pagination implemented
- [ ] Database query monitoring active

### Infrastructure
- [ ] CDN configured for static assets
- [ ] Gzip compression enabled
- [ ] Caching headers optimized
- [ ] Database auto-scaling configured
- [ ] API rate limiting tuned based on load testing
- [ ] Server response times monitored
- [ ] Cost optimized (resource utilization < 80%)

---

## Monitoring & Alerting Setup

### Sentry Configuration
```typescript
// backend/src/server.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  attachStacktrace: true,
  beforeSend: (event) => {
    // Redact sensitive data
    if (event.request?.url) {
      event.request.url = event.request.url.replace(/(password=)[^&]*/g, '$1[REDACTED]');
    }
    return event;
  }
});
```

### Key Metrics to Monitor
- [ ] Error rate (target: < 0.5%)
- [ ] API response time (target: < 200ms p95)
- [ ] Database connection pool usage
- [ ] Redis memory usage
- [ ] Disk space
- [ ] CPU usage
- [ ] Memory usage
- [ ] Active user count
- [ ] Request/response rates

### Alerts to Configure
- [ ] Error rate > 5%
- [ ] API response time > 1s
- [ ] Database connection pool near full
- [ ] Redis memory > 80%
- [ ] Disk space < 10%
- [ ] CPU > 85%
- [ ] Memory > 85%
- [ ] Failed transactions
- [ ] Invalid CSRF tokens (sudden spike)

---

## Backup & Disaster Recovery

### Backup Strategy
```bash
# Daily incremental backups
0 2 * * * pg_dump -h $DB_HOST $DB_NAME | gzip > /backups/daily-$(date +\%Y\%m\%d).sql.gz

# Weekly full backups (keep for 30 days)
0 3 * * 0 pg_dump -h $DB_HOST -Fc $DB_NAME > /backups/weekly-$(date +\%Y-W\%V).dump

# Monthly backups (keep for 1 year)
0 4 1 * * pg_dump -h $DB_HOST -Fc $DB_NAME > /backups/monthly-$(date +\%Y\%m).dump

# Upload to S3
*/6 * * * * aws s3 sync /backups s3://neotoons-backups --delete
```

### Recovery Procedure
```bash
# 1. Stop the application
systemctl stop neotoons-api

# 2. Restore from backup
pg_restore -h $DB_HOST -d $DB_NAME /backups/backup.dump

# 3. Verify data integrity
psql 'postgresql://...' -c "SELECT COUNT(*) FROM users;"

# 4. Restart application
systemctl start neotoons-api

# 5. Notify users if needed
```

### Testing
- [ ] Backup creation tested weekly
- [ ] Restore procedure tested monthly
- [ ] Recovery scripts validated
- [ ] RTO (Recovery Time Objective): < 1 hour
- [ ] RPO (Recovery Point Objective): < 1 hour

---

## Go-Live Checklist

### 48 Hours Before Launch
- [ ] Final security audit completed
- [ ] All tests passing (100%)
- [ ] Load testing completed (handles 2x expected)
- [ ] Backup tested and verified
- [ ] Disaster recovery plan reviewed
- [ ] On-call rotation established
- [ ] Status page created and working
- [ ] Communication plan ready

### 24 Hours Before Launch
- [ ] DNS pre-configured (but not pointed)
- [ ] SSL certificate installed
- [ ] Monitoring active and alerting tested
- [ ] Team briefing completed
- [ ] Rollback plan documented
- [ ] Support team trained

### Launch Day
- [ ] Start recording all systems
- [ ] Point DNS to production
- [ ] Monitor error rates (first 30 minutes critical)
- [ ] Monitor user flows (signup, login, generation)
- [ ] Be ready to rollback
- [ ] Post-launch: communicate with early users

### Post-Launch (First Week)
- [ ] Daily security reviews
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Bug fixes deployed as needed
- [ ] Scaling adjustments based on load

---

## Post-Launch Optimization

### Week 1-2
- [ ] Monitor error rates and fix critical issues
- [ ] Optimize database queries based on real usage
- [ ] Adjust rate limiting if needed
- [ ] Fine-tune caching strategy
- [ ] Respond to user feedback

### Month 1
- [ ] Performance optimization
- [ ] Security hardening based on real attack patterns
- [ ] Scale infrastructure if needed
- [ ] Implement missing features from roadmap
- [ ] Customer onboarding improvements

### Ongoing
- [ ] Monthly security audits
- [ ] Quarterly penetration testing
- [ ] Annual architecture review
- [ ] Keep dependencies updated
- [ ] Monitor compliance requirements

---

## Support & Escalation Contacts

Create this document and distribute to team:

```
PRODUCTION SUPPORT RUNBOOK

On-Call Engineer: [Name] ([Phone])
Backup Engineer: [Name] ([Phone])
Engineering Lead: [Name] ([Phone])

CRITICAL ISSUES:
- Zero user authentication
- Data loss/corruption
- Service completely down
- Security breach
→ Escalate immediately to Engineering Lead

HIGH PRIORITY:
- 50%+ error rate
- > 5s API response time
- Database connection issues
→ Escalate to On-Call Engineer

STANDARD:
- < 5% error rate
- Performance degradation
- Minor bugs
→ Create ticket and assign to team

COMMUNICATION:
- During outage: Post to status page every 15 minutes
- Major incidents: Notify users via email
- Post-mortem: Document within 24 hours
```

---

## Compliance & Legal

- [ ] Privacy Policy updated
- [ ] Terms of Service finalized
- [ ] Cookie policy published
- [ ] GDPR compliance verified (if EU users)
- [ ] CCPA compliance verified (if CA users)
- [ ] Data retention policy documented
- [ ] User data export feature implemented
- [ ] Account deletion feature implemented
- [ ] Audit logs kept for 1+ years
- [ ] Legal review completed

---

## Success Criteria

✅ **LAUNCH SUCCESS** when:
1. **Uptime > 99.9%** (first week)
2. **Error rate < 0.5%**
3. **API response time < 200ms (p95)**
4. **Zero security incidents**
5. **All user critical flows working**
6. **Customer support < 5% of users needing help**
7. **NPS score > 30**

🚨 **ROLLBACK TRIGGER** if:
1. Uptime drops below 95%
2. Error rate exceeds 5%
3. Security vulnerability discovered
4. Data corruption detected
5. Payment processing failures

---

**Questions?** Contact: [engineering lead email]

**Last Updated:** March 31, 2026
