# 🧪 Testing Guide - Dynamic Evaluation System

## Quick Test Steps

### 1. Test Dynamic Skills Assessment

**Login as Advisor:**
1. Go to http://localhost:3000
2. Login with advisor credentials (e.g., harm@gmail.com or muhee@gmail.com)
3. Navigate to Advisor Dashboard
4. Select any student from the sidebar

**Test Adding Skills:**
1. Click "Submit Evaluation" button
2. You should see 3 default skills:
   - Communication (score: 75)
   - Technical Skills (score: 75)
   - Problem Solving (score: 75)
3. Click "+ Add Skill" button
4. Type a new skill name (e.g., "Teamwork")
5. Adjust the score using the slider
6. Verify the skill is added to the list

**Test Removing Skills:**
1. Click the 🗑️ icon next to any skill
2. The skill should be removed
3. Try to remove all skills - you should get an error (min 1 required)

**Test Score Changes:**
1. Move any skill slider
2. Watch the score badge change color:
   - Red (0-39)
   - Yellow (40-59)
   - Blue (60-79)
   - Green (80-100)
3. Watch the "Real-time Score Display" update:
   - Total Score should show the sum
   - Average Score should show the average

### 2. Test Form Submission

**Create New Evaluation:**
1. Add 4-5 skills with different scores
2. Fill in Comments (at least 50 characters)
3. Add Strengths (optional)
4. Add Areas for Improvement (optional)
5. Select a Recommendation
6. Click "Submit Evaluation"
7. Verify success message

**Verify in Database:**
The evaluation should be saved with:
- skillsAssessment array
- totalScore (auto-calculated)
- averageScore (auto-calculated)

### 3. Test Update Evaluation

1. Click "Submit Evaluation" again on the same student
2. You should see:
   - Blue banner saying "Update Mode"
   - All previous data loaded
   - "📄 Download PDF" button visible
3. Modify any skill (change score or add/remove skills)
4. Click "Update Evaluation"
5. Verify changes are saved

### 4. Test PDF Download

1. After submitting an evaluation, click "Submit Evaluation" again
2. Click the "📄 Download PDF" button in the blue banner
3. A PDF should download with:
   - Student name in filename
   - Professional header
   - Student information
   - Skills assessment table
   - Score summary
   - Comments, strengths, areas for improvement
   - Recommendation
   - Page numbers

### 5. Test Validation

**Empty Skill Name:**
1. Add a new skill
2. Leave the name empty
3. Try to submit
4. You should get error: "All skill names must be filled in"

**Invalid Score:**
- Scores are automatically limited to 0-100 by the slider

**Short Comments:**
1. Type less than 50 characters in comments
2. Try to submit
3. You should get error: "Comments must be at least 50 characters"

### 6. Test Backend API

**Using Browser DevTools or Postman:**

**Get Evaluation by Application:**
```
GET /api/evaluations/application/:applicationId
Headers: Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "success": true,
  "evaluation": {
    "_id": "...",
    "student": {...},
    "advisor": {...},
    "skillsAssessment": [
      { "skillName": "Communication", "score": 85 },
      { "skillName": "Technical Skills", "score": 90 },
      { "skillName": "Teamwork", "score": 82 }
    ],
    "totalScore": 257,
    "averageScore": 86,
    "comments": "...",
    "recommendation": "Highly Recommended"
  }
}
```

---

## Expected Behaviors

✅ **Add Skill**: Creates new empty skill with score 50
✅ **Delete Skill**: Removes skill (min 1 enforced)
✅ **Score Changes**: Real-time calculation updates instantly
✅ **Color Coding**: Badge color changes based on score
✅ **Form Validation**: Prevents submission with invalid data
✅ **Auto-calculation**: Backend calculates total and average
✅ **PDF Generation**: Creates professional PDF report
✅ **Update Mode**: Loads existing data for editing

---

## Common Issues & Solutions

### Issue: jsPDF not found
**Solution**: Run `cd frontend && npm install jspdf jspdf-autotable`

### Issue: Frontend won't compile
**Solution**:
1. Stop the frontend server (Ctrl+C)
2. Delete `node_modules` folder in frontend
3. Run `npm install`
4. Run `npm start`

### Issue: PDF downloads but is blank
**Solution**: Check browser console for errors. Ensure `studentInfo` is loaded.

### Issue: Backend returns 400 error
**Solution**: Check that `skillsAssessment` array has at least 1 skill with valid name and score.

### Issue: Old evaluations won't load
**Solution**: Old evaluations with the old schema will need to be migrated or manually updated.

---

## API Testing with curl

**Submit New Evaluation:**
```bash
curl -X POST http://localhost:5000/api/evaluations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "applicationId": "APP_ID",
    "studentId": "STUDENT_ID",
    "skillsAssessment": [
      {"skillName": "Communication", "score": 85},
      {"skillName": "Technical Skills", "score": 90},
      {"skillName": "Teamwork", "score": 78}
    ],
    "comments": "Excellent performance throughout the internship. The student demonstrated strong technical abilities.",
    "strengths": "Great communicator, quick learner",
    "areasForImprovement": "Could improve time management",
    "recommendation": "Highly Recommended"
  }'
```

**Update Evaluation:**
```bash
curl -X PUT http://localhost:5000/api/evaluations/EVALUATION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "skillsAssessment": [
      {"skillName": "Communication", "score": 90},
      {"skillName": "Technical Skills", "score": 95},
      {"skillName": "Leadership", "score": 85}
    ],
    "comments": "Updated evaluation with improved scores."
  }'
```

---

## Screenshots Checklist

When testing, capture screenshots of:
1. ✅ Advisor Dashboard with students list
2. ✅ Evaluation form with default 3 skills
3. ✅ Evaluation form with 5+ custom skills
4. ✅ Real-time score calculation (Total & Average)
5. ✅ Score badge color changes
6. ✅ Form validation error messages
7. ✅ Success message after submission
8. ✅ Update mode with blue banner
9. ✅ Downloaded PDF file
10. ✅ PDF content (opened in PDF viewer)

---

## Performance Checklist

- [ ] Form loads quickly (<1 second)
- [ ] Sliders respond smoothly
- [ ] Score calculation is instant
- [ ] No lag when adding/removing skills
- [ ] PDF generation completes in <3 seconds
- [ ] No console errors
- [ ] No backend errors

---

## Browser Compatibility

Test in:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

---

## Mobile Responsiveness

Test on mobile/tablet view:
- [ ] Form layout is readable
- [ ] Sliders are usable
- [ ] Buttons are tappable
- [ ] PDF downloads work

---

**Status**: Ready for Testing! 🎉
**Access**: http://localhost:3000
**Advisor Test Account**: muhee@gmail.com or harm@gmail.com
