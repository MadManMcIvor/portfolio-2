import { skills } from '../data/skills.js';

export function initSkills() {
  const section = document.querySelector('[data-section="skills"]');
  if (!section) return;

  const skillsGrid = section.querySelector('.skills-grid');
  if (!skillsGrid) return;

  skillsGrid.innerHTML = skills.categories.map(category => `
    <div class="skills-col">
      <h4>${category.name}</h4>
      <ul>
        ${category.items.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}
