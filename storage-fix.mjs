import fs from 'fs';

const filePath = './server/storage.ts';
const fileContent = fs.readFileSync(filePath, 'utf8');

// Replace parentId with parentUserId in specific function contexts
let updatedContent = fileContent.replace(/getFamilyGroupsByParentId\(parentId: number\)/g, 'getFamilyGroupsByParentId(parentId: number)');
updatedContent = updatedContent.replace(/getFamilyMembersByParentId\(parentId: number\)/g, 'getFamilyMembersByParentId(parentId: number)');
updatedContent = updatedContent.replace(/inArray\(familyMembers\.familyGroupId, groupIds\)/g, 'familyMembers.familyGroupId.in(groupIds)');

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('Fixed storage.ts file');