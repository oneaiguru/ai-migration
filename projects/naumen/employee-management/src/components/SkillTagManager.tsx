// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/SkillTagManager.tsx

import React, { useState, useMemo } from 'react';
import { Employee, Skill } from '../types/employee';

// ========================
// SKILL TAG MANAGER - Skill categories and assignment management
// Comprehensive skill organization and employee skill management
// ========================

interface SkillTagManagerProps {
  employees: Employee[];
  onSkillUpdate?: (employeeId: string, skills: Skill[]) => void;
  onSkillCategoryCreate?: (category: SkillCategory) => void;
  onSkillCategoryUpdate?: (categoryId: string, updates: Partial<SkillCategory>) => void;
  onSkillCategoryDelete?: (categoryId: string) => void;
}

interface SkillCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  required: boolean;
  skillCount: number;
  certificationRequired: boolean;
}

interface SkillTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  levels: string[];
  assessmentCriteria: string[];
}

interface SkillAssignment {
  employeeId: string;
  skillId: string;
  level: number;
  verified: boolean;
  lastAssessed: Date;
  assessor: string;
  expirationDate?: Date;
}