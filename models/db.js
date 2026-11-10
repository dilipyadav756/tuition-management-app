/**
 * Database Repository: EduMaster Multi-Tenant In-Memory Storage
 * In production, this layer maps to PostgreSQL/Prisma or MongoDB collections.
 */
export const db = {
  tuitions: [
    {
      id: 't_inst_1',
      name: 'Sharma Mathematics & Physics Academy',
      code: 'SHARMA-101',
      joinCode: '849201',
      phone: '+91 98765 43210',
      ownerId: 'u_teacher_1',
      upiId: 'sharmaclasses@upi',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 't_inst_2',
      name: 'Verma Science & Biology Hub',
      code: 'VERMA-202',
      joinCode: '526318',
      phone: '+91 98123 45678',
      ownerId: 'u_teacher_2',
      upiId: 'anita.verma@okaxis',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  batches: [
    {
      id: 'b1',
      tuitionId: 't_inst_1',
      teacherId: 'u_teacher_1',
      name: 'Class 10 - Batch A',
      subject: 'Mathematics & Physics',
      joinCode: '849201',
      monthlyFee: 2500,
      schedule: 'Mon, Wed, Fri (5:00 PM - 6:30 PM)'
    },
    {
      id: 'b2',
      tuitionId: 't_inst_1',
      teacherId: 'u_teacher_1',
      name: 'Class 12 - Math',
      subject: 'Advanced Mathematics',
      joinCode: '713904',
      monthlyFee: 3000,
      schedule: 'Tue, Thu, Sat (6:00 PM - 7:30 PM)'
    },
    {
      id: 'b3',
      tuitionId: 't_inst_2',
      teacherId: 'u_teacher_2',
      name: 'Class 11 - Bio',
      subject: 'Cell Biology & Genetics',
      joinCode: '526318',
      monthlyFee: 2800,
      schedule: 'Mon, Thu, Sat (4:00 PM - 5:30 PM)'
    }
  ],
  users: [
    {
      id: 'u_teacher_1',
      name: 'Prof. Rajesh Sharma',
      email: 'sharma.tuitions@gmail.com',
      phone: '9876543210',
      passwordHash: '$2a$10$wTqK/1f0KfZK0JcZvZkO3.uGk4uVq8hZ/r8r6H7hC6J.fJp3pU0a6',
      registrationJoinCode: 'SHARMA-101',
      role: 'TEACHER',
      tuitionId: 't_inst_1',
      upiId: 'sharmaclasses@upi',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'u_teacher_2',
      name: 'Ms. Anita Verma',
      email: 'anita.science@gmail.com',
      phone: '9812345678',
      passwordHash: '$2a$10$wTqK/1f0KfZK0JcZvZkO3.uGk4uVq8hZ/r8r6H7hC6J.fJp3pU0a6',
      registrationJoinCode: 'VERMA-202',
      role: 'TEACHER',
      tuitionId: 't_inst_2',
      upiId: 'anita.verma@okaxis',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'u_student_1',
      name: 'Aarav Patel',
      email: 'aarav.patel@gmail.com',
      phone: '9111122222',
      username: 'aarav101',
      passwordHash: '$2a$10$wTqK/1f0KfZK0JcZvZkO3.uGk4uVq8hZ/r8r6H7hC6J.fJp3pU0a6',
      role: 'STUDENT',
      tenants: [
        { tuitionId: 't_inst_1', tuitionName: 'Sharma Mathematics & Physics Academy', batch: 'Class 10 - Batch A', rollNo: '101' },
        { tuitionId: 't_inst_2', tuitionName: 'Verma Science & Biology Hub', batch: 'Class 10 - Foundation Science', rollNo: 'S-205' }
      ],
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'admin_root',
      name: 'Platform Super-Admin',
      email: 'admin@edumaster.io',
      phone: '9999999999',
      username: 'admin',
      passwordHash: '$2a$10$wTqK/1f0KfZK0JcZvZkO3.uGk4uVq8hZ/r8r6H7hC6J.fJp3pU0a6',
      role: 'SUPER_ADMIN',
      tuitionId: 'system_root',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  otps: new Map(),
  resetTokens: new Map()
};

export default db;
