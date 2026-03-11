const fs = require('fs');
const path = require('path');

// Files to fix with their specific replacements
const fixes = [
  // ProfileHeader.jsx
  {
    file: 'src/components/profile/ProfileHeader.jsx',
    replacements: [
      {
        from: "import axios from 'axios';",
        to: "import { uploadAPI, authAPI, getImageUrl } from '../../services/api';"
      },
      {
        from: "await axios.post('http://localhost:5000/api/upload/cover-photo', formData,",
        to: "await uploadAPI.uploadCoverPhoto(formData"
      },
      {
        from: "await axios.post('http://localhost:5000/api/upload/profile-picture', formData,",
        to: "await uploadAPI.uploadProfilePicture(formData"
      },
      {
        from: "const response = await axios.get('http://localhost:5000/api/auth/me',",
        to: "const response = await authAPI.getCurrentUser("
      },
      {
        from: "`http://localhost:5000${user.coverPhoto}`",
        to: "getImageUrl(user.coverPhoto)"
      },
      {
        from: "`http://localhost:5000${user.profilePicture}`",
        to: "getImageUrl(user.profilePicture)"
      }
    ]
  },
  // ProfileSkills.jsx
  {
    file: 'src/components/profile/ProfileSkills.jsx',
    replacements: [
      {
        from: "import axios from 'axios';",
        to: "import { profileAPI } from '../../services/api';"
      },
      {
        from: "await axios.put(\n        'http://localhost:5000/api/profile/skills',\n        { skills: editedSkills },\n        { headers: { 'Authorization': `Bearer ${token}` } }\n      );",
        to: "await profileAPI.updateSkills(editedSkills);"
      }
    ]
  },
  // ProfileExperience.jsx
  {
    file: 'src/components/profile/ProfileExperience.jsx',
    replacements: [
      {
        from: "import axios from 'axios';",
        to: "import { profileAPI } from '../../services/api';"
      },
      {
        from: "const url = editingId\n        ? `http://localhost:5000/api/profile/experience/${editingId}`\n        : 'http://localhost:5000/api/profile/experience';\n      \n      const method = editingId ? 'put' : 'post';\n      await axios[method](url, formData, {\n        headers: { 'Authorization': `Bearer ${token}` }\n      });",
        to: "if (editingId) {\n        await profileAPI.updateExperience(editingId, formData);\n      } else {\n        await profileAPI.addExperience(formData);\n      }"
      },
      {
        from: "await axios.delete(`http://localhost:5000/api/profile/experience/${expId}`, {\n        headers: { 'Authorization': `Bearer ${token}` }\n      });",
        to: "await profileAPI.deleteExperience(expId);"
      }
    ]
  },
  // ProfileEducation.jsx
  {
    file: 'src/components/profile/ProfileEducation.jsx',
    replacements: [
      {
        from: "import axios from 'axios';",
        to: "import { profileAPI } from '../../services/api';"
      },
      {
        from: "const url = editingId\n        ? `http://localhost:5000/api/profile/education/${editingId}`\n        : 'http://localhost:5000/api/profile/education';\n      \n      const method = editingId ? 'put' : 'post';\n      await axios[method](url, formData, {\n        headers: { 'Authorization': `Bearer ${token}` }\n      });",
        to: "if (editingId) {\n        await profileAPI.updateEducation(editingId, formData);\n      } else {\n        await profileAPI.addEducation(formData);\n      }"
      },
      {
        from: "await axios.delete(`http://localhost:5000/api/profile/education/${eduId}`, {\n        headers: { 'Authorization': `Bearer ${token}` }\n      });",
        to: "await profileAPI.deleteEducation(eduId);"
      }
    ]
  }
];

console.log('This script would fix localhost URLs in the following files:');
fixes.forEach(fix => {
  console.log(`- ${fix.file} (${fix.replacements.length} replacements)`);
});
console.log('\nPlease apply these fixes manually or use the strReplace tool.');
