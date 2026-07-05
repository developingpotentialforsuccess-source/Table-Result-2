import { Level } from '../types';

export const SYSTEM_TEMPLATES = [
  {
    id: 'full-time-english',
    name: 'Full-Time English Program',
    authorName: 'System',
    levels: [
      {
        id: 'fte_2a',
        name: 'Level 2A',
        customDivisor: 5,
        midtermCustomDivisor: 4,
        finalCustomDivisor: 4,
        gradingScale: [
          { grade: 'A+', minScore: 90 },
          { grade: 'A', minScore: 85 },
          { grade: 'A-', minScore: 80 },
          { grade: 'B+', minScore: 75 },
          { grade: 'B', minScore: 70 },
          { grade: 'B-', minScore: 65 },
          { grade: 'C+', minScore: 60 },
          { grade: 'C', minScore: 55 },
          { grade: 'C-', minScore: 50 },
          { grade: 'D', minScore: 45 },
          { grade: 'E', minScore: 40 },
          { grade: 'F', minScore: 0 },
        ],
        subjects: [
          {
            id: 'fte_2a_attendance',
            name: 'Attendance',
            targetWeight: 100,
            midtermTargetWeight: 0,
            finalTargetWeight: 0,
            categories: [
              {
                id: 'fte_2a_att_main',
                name: 'Attendance',
                weight: 100,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 0,
              }
            ]
          },
          {
            id: 'fte_2a_reading',
            name: 'Reading',
            targetWeight: 100,
            midtermTargetWeight: 100,
            finalTargetWeight: 100,
            categories: [
              {
                id: 'fte_2a_read_wq',
                name: 'Weekly Quiz',
                weight: 5,
                itemCount: 10,
                itemMaxScores: [100,100,100,100,100,100,100,100,100,100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_read_icq',
                name: 'In-Class Quiz',
                weight: 5,
                itemCount: 10,
                itemMaxScores: [100,100,100,100,100,100,100,100,100,100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_read_hw',
                name: 'Homework',
                weight: 5,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_read_as_a',
                name: 'Reading Assignment A',
                weight: 8,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_read_as_b',
                name: 'Reading Assignment B',
                weight: 6,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_read_part',
                name: 'Attendance & Class Participation',
                weight: 5,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_read_mt',
                name: 'Midterm Test',
                weight: 26,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 100,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_read_ft',
                name: 'Final Test',
                weight: 40,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 100,
              }
            ]
          },
          {
            id: 'fte_2a_writing',
            name: 'Writing',
            targetWeight: 100,
            midtermTargetWeight: 100,
            finalTargetWeight: 100,
            categories: [
              {
                id: 'fte_2a_writ_wq',
                name: 'Weekly Quiz',
                weight: 5,
                itemCount: 10,
                itemMaxScores: [100,100,100,100,100,100,100,100,100,100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_writ_icq',
                name: 'In-Class Quiz',
                weight: 5,
                itemCount: 10,
                itemMaxScores: [100,100,100,100,100,100,100,100,100,100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_writ_jw',
                name: 'Journal Writing',
                weight: 5,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_writ_as_a',
                name: 'Writing Assignment A',
                weight: 5,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_writ_as_b',
                name: 'Writing Assignment B',
                weight: 5,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_writ_hw',
                name: 'Homework',
                weight: 5,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_writ_part',
                name: 'Attendance & Class Participation',
                weight: 5,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_writ_mt',
                name: 'Midterm Test',
                weight: 25,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 100,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_writ_ft',
                name: 'Final Test',
                weight: 40,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 100,
              }
            ]
          },
          {
            id: 'fte_2a_computer',
            name: 'Computer',
            targetWeight: 100,
            midtermTargetWeight: 100,
            finalTargetWeight: 100,
            categories: [
              {
                id: 'fte_2a_comp_att',
                name: 'Attendance',
                weight: 5,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_comp_part',
                name: 'Class Participation',
                weight: 5,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_comp_mt',
                name: 'Midterm Test',
                weight: 40,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 100,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_comp_ft',
                name: 'Final Test',
                weight: 50,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 100,
              }
            ]
          },
          {
            id: 'fte_2a_listening',
            name: 'Listening',
            targetWeight: 100,
            midtermTargetWeight: 100,
            finalTargetWeight: 100,
            categories: [
              {
                id: 'fte_2a_list_wq',
                name: 'Weekly Quiz',
                weight: 5,
                itemCount: 10,
                itemMaxScores: [100,100,100,100,100,100,100,100,100,100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_list_icq',
                name: 'In-Class Quiz',
                weight: 5,
                itemCount: 10,
                itemMaxScores: [100,100,100,100,100,100,100,100,100,100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_list_hw',
                name: 'Homework',
                weight: 5,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_list_part',
                name: 'Attendance & Class Participation',
                weight: 5,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_list_mt',
                name: 'Midterm Test',
                weight: 30,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 100,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_list_ft',
                name: 'Final Test',
                weight: 50,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 100,
              }
            ]
          },
          {
            id: 'fte_2a_speaking',
            name: 'Speaking',
            targetWeight: 100,
            midtermTargetWeight: 100,
            finalTargetWeight: 100,
            categories: [
              {
                id: 'fte_2a_spea_wq',
                name: 'Weekly Quiz',
                weight: 5,
                itemCount: 10,
                itemMaxScores: [100,100,100,100,100,100,100,100,100,100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_spea_icq',
                name: 'In-Class Quiz',
                weight: 5,
                itemCount: 10,
                itemMaxScores: [100,100,100,100,100,100,100,100,100,100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_spea_pres',
                name: 'Presentation',
                weight: 8,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_spea_pair',
                name: 'Pair-Conversation',
                weight: 7,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_spea_part',
                name: 'Homework, Attendance & Class Participation',
                weight: 5,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_spea_mt',
                name: 'Midterm Test',
                weight: 25,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 100,
                finalWeight: 0,
              },
              {
                id: 'fte_2a_spea_ft',
                name: 'Final Test',
                weight: 40,
                itemCount: 1,
                itemMaxScores: [100],
                midtermWeight: 0,
                finalWeight: 100,
              }
            ]
          }
        ]
      },
      {
        id: 'fte_2b',
        name: 'Level 2B',
        customDivisor: 5,
        midtermCustomDivisor: 6,
        finalCustomDivisor: 4,
        gradingScale: [
          { grade: 'A+', minScore: 90 },
          { grade: 'A', minScore: 85 },
          { grade: 'A-', minScore: 80 },
          { grade: 'B+', minScore: 75 },
          { grade: 'B', minScore: 70 },
          { grade: 'B-', minScore: 65 },
          { grade: 'C+', minScore: 60 },
          { grade: 'C', minScore: 55 },
          { grade: 'C-', minScore: 50 },
          { grade: 'D', minScore: 45 },
          { grade: 'E', minScore: 40 },
          { grade: 'F', minScore: 0 },
        ],
        subjects: [
          {
            id: 'fte_2b_attendance',
            name: 'Attendance',
            targetWeight: 100,
            midtermTargetWeight: 0,
            finalTargetWeight: 0,
            categories: [
              { id: 'fte_2b_att_main', name: 'Attendance', weight: 100, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 0 }
            ]
          },
          {
            id: 'fte_2b_reading',
            name: 'Reading',
            targetWeight: 100,
            midtermTargetWeight: 100,
            finalTargetWeight: 100,
            categories: [
              { id: 'fte_2b_read_wq', name: 'Weekly Quiz', weight: 5, itemCount: 10, itemMaxScores: [100,100,100,100,100,100,100,100,100,100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_read_icq', name: 'In-Class Quiz', weight: 5, itemCount: 10, itemMaxScores: [100,100,100,100,100,100,100,100,100,100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_read_hw', name: 'Homework', weight: 5, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_read_as_a', name: 'Reading Assignments A', weight: 8, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_read_as_b', name: 'Reading Assignments B', weight: 6, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_read_part', name: 'Attendance & Class Participation', weight: 5, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_read_mt', name: 'Midterm Test', weight: 26, itemCount: 1, itemMaxScores: [100], midtermWeight: 30, finalWeight: 0 },
              { id: 'fte_2b_read_dict', name: 'Dictation', weight: 0, itemCount: 1, itemMaxScores: [100], midtermWeight: 70, finalWeight: 0 },
              { id: 'fte_2b_read_ft', name: 'Final Test', weight: 40, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 100 }
            ]
          },
          {
            id: 'fte_2b_writing',
            name: 'Writing',
            targetWeight: 100,
            midtermTargetWeight: 100,
            finalTargetWeight: 100,
            categories: [
              { id: 'fte_2b_writ_wq', name: 'Weekly Quiz', weight: 5, itemCount: 10, itemMaxScores: [100,100,100,100,100,100,100,100,100,100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_writ_icq', name: 'In-Class Quiz', weight: 5, itemCount: 10, itemMaxScores: [100,100,100,100,100,100,100,100,100,100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_writ_jw', name: 'Journal Writing', weight: 5, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_writ_as_a', name: 'Writing Assignments A', weight: 5, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_writ_as_b', name: 'Writing Assignments B', weight: 5, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_writ_hw', name: 'Homework', weight: 5, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_writ_part', name: 'Attendance & Class Participation', weight: 5, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_writ_mt', name: 'Midterm Test', weight: 25, itemCount: 1, itemMaxScores: [100], midtermWeight: 100, finalWeight: 0 },
              { id: 'fte_2b_writ_ft', name: 'Final Test', weight: 40, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 100 }
            ]
          },
          {
            id: 'fte_2b_computer',
            name: 'Computer',
            targetWeight: 100,
            midtermTargetWeight: 100,
            finalTargetWeight: 100,
            categories: [
              { id: 'fte_2b_comp_att', name: 'Attendance', weight: 5, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_comp_part', name: 'Class Participation', weight: 5, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_comp_mt', name: 'Midterm Test', weight: 40, itemCount: 1, itemMaxScores: [100], midtermWeight: 100, finalWeight: 0 },
              { id: 'fte_2b_comp_ft', name: 'Final Test', weight: 50, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 100 }
            ]
          },
          {
            id: 'fte_2b_listening',
            name: 'Listening',
            targetWeight: 100,
            midtermTargetWeight: 100,
            finalTargetWeight: 100,
            categories: [
              { id: 'fte_2b_list_wq', name: 'Weekly Quiz', weight: 5, itemCount: 10, itemMaxScores: [100,100,100,100,100,100,100,100,100,100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_list_icq', name: 'In-Class Quiz', weight: 5, itemCount: 10, itemMaxScores: [100,100,100,100,100,100,100,100,100,100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_list_hw', name: 'Homework', weight: 5, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_list_part', name: 'Attendance & Class Participation', weight: 5, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_list_mt', name: 'Midterm Test', weight: 30, itemCount: 1, itemMaxScores: [100], midtermWeight: 100, finalWeight: 0 },
              { id: 'fte_2b_list_ft', name: 'Final Test', weight: 50, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 100 }
            ]
          },
          {
            id: 'fte_2b_speaking',
            name: 'Speaking',
            targetWeight: 100,
            midtermTargetWeight: 100,
            finalTargetWeight: 100,
            categories: [
              { id: 'fte_2b_spea_wq', name: 'Weekly Quiz', weight: 5, itemCount: 10, itemMaxScores: [100,100,100,100,100,100,100,100,100,100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_spea_icq', name: 'In-Class Quiz', weight: 5, itemCount: 10, itemMaxScores: [100,100,100,100,100,100,100,100,100,100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_spea_pres_pic', name: 'Picture Presentation', weight: 8, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_spea_pres_tea', name: 'Presentation About a Teacher', weight: 7, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_spea_part', name: 'Homework, Attendance & Class Participation', weight: 5, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 0 },
              { id: 'fte_2b_spea_mt', name: 'Midterm Test', weight: 25, itemCount: 1, itemMaxScores: [100], midtermWeight: 100, finalWeight: 0 },
              { id: 'fte_2b_spea_ft', name: 'Final Test', weight: 40, itemCount: 1, itemMaxScores: [100], midtermWeight: 0, finalWeight: 100 }
            ]
          },
          {
            id: 'fte_2b_vocabulary',
            name: 'Vocabulary',
            targetWeight: 0,
            midtermTargetWeight: 100,
            finalTargetWeight: 0,
            categories: [
              { id: 'fte_2b_voc_main', name: 'Vocabulary', weight: 100, itemCount: 1, itemMaxScores: [100], midtermWeight: 100, finalWeight: 0 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'part-time-english',
    name: 'Part-Time English Program',
    authorName: 'System',
    levels: []
  },
  {
    id: 'khmer-program',
    name: 'Khmer Program',
    authorName: 'System',
    levels: []
  },
  {
    id: 'math-program',
    name: 'Math Program',
    authorName: 'System',
    levels: []
  }
];
