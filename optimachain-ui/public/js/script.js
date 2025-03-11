/**
 * OptimaChain Roadmap Script
 * Handles roadmap timeline animations and interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initRoadmapTimeline();
});

function initRoadmapTimeline() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  // Add animation classes to timeline items
  timelineItems.forEach((item, index) => {
    // Add a slight delay to each item for staggered animation
    const delay = index * 150;
    item.style.transitionDelay = `${delay}ms`;
    
    // Add visible class after a short delay
    setTimeout(() => {
      item.classList.add('visible');
    }, 100 + delay);
  });
  
  // Add click handlers for expandable items
  const expandableItems = document.querySelectorAll('.timeline-item.expandable');
  expandableItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('expanded');
    });
  });
}
