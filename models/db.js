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
      phone: '+91 98765 43210',
      ownerId: 'u_teacher_1',
      upiId: 'sharmaclasses@upi',
      createdAt: new Date().toISOString()
    },
    {
      id: 't_inst_2',
      name: 'Verma Science & Biology Hub',
      code: 'VERMA-202',
      phone: '+91 98123 45678',
      ownerId: 'u_teacher_2',
      upiId: 'anita.verma@okaxis',
      createdAt: new Date().toISOString()
    }
  ],
  users: [
    {
      id: 'u_teacher_1',
      name: 'Prof. Rajesh Sharma',
      email: 'sharma.tuitions@gmail.com',
      phone: '9876543210',
      passwordHash: '$2a$10$wTqK/1f0KfZK0JcZvZkO3.uGk4uVq8hZ/r8r6H7hC6J.fJp3pU0a6',
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
