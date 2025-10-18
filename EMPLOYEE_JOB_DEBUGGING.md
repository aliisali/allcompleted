# Employee Job Visibility Debugging Guide

## Issue
Jobs assigned to employees are not showing up in the employee's job list.

## Database Status
✅ Database schema is properly set up with all tables
✅ Jobs are being assigned with `employee_id` correctly in the database
✅ RLS policies are configured to allow access

## Current Situation

### Database Data
Based on the database query, we have:

**Jobs:**
- Job `JOB-1760777430982` (title: "tyyab") - assigned to employee `550e8400-e29b-41d4-a716-446655440003` (status: confirmed)
- Job `JOB-1760777668594` (title: "ewerw") - NOT assigned (employee_id: null)

**Employees:**
- `550e8400-e29b-41d4-a716-446655440003` - employee@blindscloud.co.uk (default employee)
- `e77c272a-913e-4680-8f63-076ee210bbae` - emaankhan@gmail.com (your account)

## Root Cause
The job was assigned to the **default employee** (`550e8400-e29b-41d4-a716-446655440003`), but you're likely logged in as a **different employee** (`emaankhan@gmail.com`).

## How to Verify & Fix

### Step 1: Check Which User You're Logged In As
1. Open the browser console (F12)
2. Look for the log: `🔍 EmployeeDashboard: Current user details:`
3. Note down the `id` field - this is YOUR employee ID

### Step 2: Assign a Job to YOUR Employee Account
1. Log in as the **business user** (business@blindscloud.co.uk, password: password)
2. Go to Job Management
3. Create a new job or select an existing unassigned job
4. Click "Assign" button
5. Select **your employee email** (emaankhan@gmail.com) from the dropdown
6. Click "Assign Job"

### Step 3: Verify Job Assignment
1. Check the console logs for:
   ```
   🔄 Assigning job: [job-id] to employee: [your-employee-id]
   💾 Updating job with employeeId: [your-employee-id]
   ✅ Job assigned successfully
   🔄 Refreshing data after job assignment...
   ```

2. Log out and log back in as your employee account
3. Go to the Employee Dashboard
4. Check console logs for:
   ```
   📋 Job: { id: '...', employeeId: '[your-employee-id]', ... }
   🔍 Checking job ...: employeeId="[your-employee-id]" vs currentUser.id="[your-employee-id]" => MATCH
   ```

### Step 4: Manual Refresh
If the job still doesn't appear:
1. Click the "Refresh Jobs" button in the employee dashboard
2. Wait for the data to reload
3. Check the console logs again

## Enhanced Logging

The system now has comprehensive logging to help debug:

### Employee Dashboard Logs
- Shows current user ID and details
- Lists all available jobs with their `employeeId`
- Shows the comparison between job `employeeId` and current user `id`
- Indicates MATCH or NO MATCH for each job

### Job Assignment Logs
- Shows which job is being assigned
- Shows which employee ID is receiving the assignment
- Confirms when the database update completes
- Shows when data refresh happens

## Testing Checklist

- [ ] Create a new job as employee
- [ ] Log in as business user
- [ ] Assign the job to YOUR specific employee account (not the default employee)
- [ ] Log out and log back in as employee
- [ ] Verify the job appears in employee dashboard
- [ ] Check console logs show MATCH for the assigned job
- [ ] Try manual refresh button if needed
- [ ] Verify auto-refresh works after 30 seconds

## Common Issues

### Issue 1: Wrong Employee Selected
**Symptom:** Jobs assigned but not visible
**Cause:** Job assigned to different employee account
**Solution:** Assign job to correct employee email

### Issue 2: Data Not Refreshing
**Symptom:** Job assigned but takes time to appear
**Cause:** Client-side cache not refreshed
**Solution:** Click "Refresh Jobs" button or wait for auto-refresh (30s)

### Issue 3: Multiple Employee Accounts
**Symptom:** Confusion about which account has jobs
**Cause:** Multiple employees with similar names
**Solution:** Always check console logs for exact user IDs

## Default Test Accounts

Use these accounts for testing:

**Admin:**
- Email: admin@blindscloud.co.uk
- Password: password

**Business User:**
- Email: business@blindscloud.co.uk
- Password: password

**Default Employee:**
- Email: employee@blindscloud.co.uk
- Password: password

**Your Employee:**
- Email: emaankhan@gmail.com
- Password: [your password]

## Next Steps

1. Open the application
2. Check the browser console
3. Look at the logs when you're on the employee dashboard
4. Share the console output to see what's happening
5. Try assigning a job to your specific employee account
6. Verify it appears after assignment

The enhanced logging will show exactly what's happening at each step!
