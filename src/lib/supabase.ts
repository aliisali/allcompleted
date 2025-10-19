import { createClient } from '@supabase/supabase-js';
import { User, Business, Job, Customer, Product, Notification } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class DatabaseService {
  static isAvailable(): boolean {
    return !!(supabaseUrl && supabaseAnonKey);
  }

  static hasValidCredentials(): boolean {
    return !!(supabaseUrl && supabaseAnonKey);
  }

  static async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password_hash,
        role: user.role,
        businessId: user.business_id,
        permissions: user.permissions || [],
        createdAt: user.created_at,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        verificationToken: user.verification_token
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  static async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: userData.email,
          name: userData.name,
          password_hash: userData.password,
          role: userData.role,
          business_id: userData.businessId || null,
          parent_id: null,
          permissions: userData.permissions || [],
          is_active: true,
          email_verified: false
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        password: data.password_hash,
        role: data.role,
        businessId: data.business_id,
        permissions: data.permissions || [],
        createdAt: data.created_at,
        isActive: data.is_active,
        emailVerified: data.email_verified
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<void> {
    try {
      const updateData: any = {};
      if (userData.email) updateData.email = userData.email;
      if (userData.name) updateData.name = userData.name;
      if (userData.password) updateData.password_hash = userData.password;
      if (userData.role) updateData.role = userData.role;
      if (userData.businessId !== undefined) updateData.business_id = userData.businessId;
      if (userData.permissions) updateData.permissions = userData.permissions;
      if (userData.isActive !== undefined) updateData.is_active = userData.isActive;

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async deleteUser(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async getBusinesses(): Promise<Business[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(business => ({
        id: business.id,
        name: business.name,
        address: business.address,
        phone: business.phone || '',
        email: business.email || '',
        adminId: business.admin_id,
        features: business.features || [],
        subscription: business.subscription || 'basic',
        vrViewEnabled: business.vr_view_enabled || false,
        createdAt: business.created_at
      }));
    } catch (error) {
      console.error('Error fetching businesses:', error);
      return [];
    }
  }

  static async createBusiness(businessData: Omit<Business, 'id' | 'createdAt'>): Promise<Business> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert([{
          name: businessData.name,
          address: businessData.address,
          phone: businessData.phone,
          email: businessData.email,
          admin_id: businessData.adminId,
          features: businessData.features || [],
          subscription: businessData.subscription || 'basic',
          vr_view_enabled: businessData.vrViewEnabled || false
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        adminId: data.admin_id,
        features: data.features || [],
        subscription: data.subscription,
        vrViewEnabled: data.vr_view_enabled,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error creating business:', error);
      throw error;
    }
  }

  static async updateBusiness(id: string, businessData: Partial<Business>): Promise<void> {
    try {
      const updateData: any = {};
      if (businessData.name) updateData.name = businessData.name;
      if (businessData.address) updateData.address = businessData.address;
      if (businessData.phone !== undefined) updateData.phone = businessData.phone;
      if (businessData.email !== undefined) updateData.email = businessData.email;
      if (businessData.features) updateData.features = businessData.features;
      if (businessData.subscription) updateData.subscription = businessData.subscription;
      if (businessData.vrViewEnabled !== undefined) updateData.vr_view_enabled = businessData.vrViewEnabled;

      const { error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating business:', error);
      throw error;
    }
  }

  static async deleteBusiness(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting business:', error);
      throw error;
    }
  }

  static async getCustomers(): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        mobile: customer.mobile || '',
        address: customer.address,
        postcode: customer.postcode || '',
        businessId: customer.business_id,
        createdAt: customer.created_at
      }));
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  }

  static async createCustomer(customerData: any): Promise<Customer> {
    try {
      console.log('📝 Creating customer with data:', customerData);

      const { data, error } = await supabase
        .from('customers')
        .insert([{
          name: customerData.name,
          email: customerData.email || null,
          phone: customerData.phone || null,
          mobile: customerData.mobile || null,
          address: customerData.address,
          postcode: customerData.postcode || null,
          business_id: customerData.businessId
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error creating customer:', error);
        throw new Error(`Failed to create customer: ${error.message} (Code: ${error.code})`);
      }

      if (!data) {
        throw new Error('No data returned from customer creation');
      }

      console.log('✅ Customer created successfully:', data.id);

      return {
        id: data.id,
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        mobile: data.mobile || '',
        address: data.address,
        postcode: data.postcode || '',
        businessId: data.business_id,
        createdAt: data.created_at
      };
    } catch (error: any) {
      console.error('❌ Error creating customer:', error);
      throw error;
    }
  }

  static async updateCustomer(id: string, customerData: Partial<Customer>): Promise<void> {
    try {
      const updateData: any = {};
      if (customerData.name) updateData.name = customerData.name;
      if (customerData.email !== undefined) updateData.email = customerData.email || null;
      if (customerData.phone !== undefined) updateData.phone = customerData.phone || null;
      if (customerData.mobile !== undefined) updateData.mobile = customerData.mobile || null;
      if (customerData.address) updateData.address = customerData.address;
      if (customerData.postcode !== undefined) updateData.postcode = customerData.postcode || null;

      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  static async deleteCustomer(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  static async getJobs(): Promise<Job[]> {
    try {
      console.log('📥 DatabaseService.getJobs: Fetching jobs from Supabase...');

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log(`✅ Retrieved ${data?.length || 0} jobs from database`);

      const mappedJobs = (data || []).map(job => {
        const mapped = {
          id: job.id,
          title: job.title,
          description: job.description || '',
          jobType: 'measurement' as const,
          status: job.status || 'pending',
          customerId: job.customer_id,
          employeeId: job.employee_id || null,
          businessId: job.business_id,
          scheduledDate: job.scheduled_date,
          scheduledTime: new Date(job.scheduled_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          completedDate: job.completed_date || undefined,
          quotation: parseFloat(job.quotation) || 0,
          invoice: parseFloat(job.invoice) || 0,
          signature: job.signature || '',
          images: job.images || [],
          documents: job.documents || [],
          checklist: job.checklist || [],
          measurements: [],
          selectedProducts: [],
          jobHistory: [],
          createdAt: job.created_at
        };

        if (job.employee_id) {
          console.log(`📋 Job "${job.title}" (${job.id}) -> employee: ${job.employee_id}`);
        }

        return mapped;
      });

      return mappedJobs;
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      return [];
    }
  }

  static async createJob(jobData: any): Promise<Job> {
    try {
      console.log('📝 DatabaseService: Creating job with data:', jobData);

      // Validate required fields
      if (!jobData.customerId) {
        throw new Error('Customer ID is required');
      }
      if (!jobData.businessId) {
        throw new Error('Business ID is required');
      }
      if (!jobData.scheduledDate) {
        throw new Error('Scheduled date is required');
      }

      // Format the scheduled date to include time
      const scheduledDateTime = jobData.scheduledDate + ' ' + (jobData.scheduledTime || '09:00');

      // Generate a unique ID using timestamp + random string to prevent conflicts
      const generateJobId = () => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        return `JOB-${timestamp}-${random}`;
      };

      const insertData = {
        id: jobData.id || generateJobId(),
        title: jobData.title,
        description: jobData.description || '',
        status: jobData.status || 'pending',
        customer_id: jobData.customerId,
        employee_id: jobData.employeeId || null,
        business_id: jobData.businessId,
        scheduled_date: scheduledDateTime,
        quotation: jobData.quotation || 0,
        invoice: jobData.invoice || 0,
        signature: jobData.signature || null,
        images: jobData.images || [],
        documents: jobData.documents || [],
        checklist: jobData.checklist || []
      };

      console.log('📝 DatabaseService: Inserting to Supabase:', insertData);

      const { data, error } = await supabase
        .from('jobs')
        .insert([insertData])
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ DatabaseService: Supabase error:', error);
        throw new Error(`Failed to create job: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from job creation');
      }

      console.log('✅ DatabaseService: Job created successfully:', data);

      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        jobType: jobData.jobType || 'measurement',
        status: data.status,
        customerId: data.customer_id,
        employeeId: data.employee_id || null,
        businessId: data.business_id,
        scheduledDate: data.scheduled_date,
        scheduledTime: jobData.scheduledTime || '09:00',
        quotation: parseFloat(data.quotation) || 0,
        invoice: parseFloat(data.invoice) || 0,
        signature: data.signature || '',
        images: data.images || [],
        documents: data.documents || [],
        checklist: data.checklist || [],
        measurements: jobData.measurements || [],
        selectedProducts: jobData.selectedProducts || [],
        jobHistory: jobData.jobHistory || [],
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('❌ DatabaseService: Error creating job:', error);
      throw error;
    }
  }

  static async updateJob(id: string, jobData: any): Promise<void> {
    try {
      console.log('🔄 DatabaseService.updateJob called with:', { id, jobData });

      const updateData: any = {};
      if (jobData.title) updateData.title = jobData.title;
      if (jobData.description !== undefined) updateData.description = jobData.description;
      if (jobData.status) updateData.status = jobData.status;
      if (jobData.employeeId !== undefined) {
        updateData.employee_id = jobData.employeeId || null;
        console.log('✅ Setting employee_id to:', updateData.employee_id);
      }
      if (jobData.scheduledDate) updateData.scheduled_date = jobData.scheduledDate;
      if (jobData.completedDate !== undefined) updateData.completed_date = jobData.completedDate;
      if (jobData.quotation !== undefined) updateData.quotation = jobData.quotation;
      if (jobData.invoice !== undefined) updateData.invoice = jobData.invoice;
      if (jobData.signature !== undefined) updateData.signature = jobData.signature;
      if (jobData.images) updateData.images = jobData.images;
      if (jobData.documents) updateData.documents = jobData.documents;
      if (jobData.checklist) updateData.checklist = jobData.checklist;

      console.log('📤 Updating job in Supabase with:', updateData);

      const { error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('❌ Supabase update failed:', error);
        throw error;
      }

      console.log('✅ Job update successful in database');
    } catch (error) {
      console.error('❌ Error updating job:', error);
      throw error;
    }
  }

  static async deleteJob(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  static async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        description: product.description || '',
        image: product.image || '',
        model3d: product.model_3d || '',
        arModel: product.ar_model || '',
        specifications: product.specifications || [],
        price: parseFloat(product.price) || 0,
        isActive: product.is_active,
        createdAt: product.created_at
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  static async createProduct(productData: any): Promise<Product> {
    try {
      console.log('Creating product with data:', productData);

      const insertData = {
        name: productData.name?.trim() || 'Unnamed Product',
        category: productData.category?.trim() || 'Uncategorized',
        description: productData.description?.trim() || '',
        image: productData.image?.trim() || '',
        model_3d: productData.model3d?.trim() || null,
        ar_model: productData.arModel?.trim() || null,
        specifications: Array.isArray(productData.specifications) ? productData.specifications.filter((s: string) => s.trim()) : [],
        price: parseFloat(productData.price) || 0,
        is_active: true
      };

      console.log('Inserting product data:', insertData);

      const { data, error } = await supabase
        .from('products')
        .insert([insertData])
        .select()
        .maybeSingle();

      if (error) {
        console.error('Supabase error creating product:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw new Error(`Failed to create product: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from product creation');
      }

      console.log('Product created successfully:', data);

      return {
        id: data.id,
        name: data.name,
        category: data.category,
        description: data.description || '',
        image: data.image || '',
        model3d: data.model_3d || '',
        arModel: data.ar_model || '',
        specifications: data.specifications || [],
        price: parseFloat(data.price) || 0,
        isActive: data.is_active,
        createdAt: data.created_at
      };
    } catch (error: any) {
      console.error('Error creating product:', error);
      throw new Error(error.message || 'Failed to create product');
    }
  }

  static async updateProduct(id: string, productData: Partial<Product>): Promise<void> {
    try {
      const updateData: any = {};
      if (productData.name) updateData.name = productData.name;
      if (productData.category) updateData.category = productData.category;
      if (productData.description !== undefined) updateData.description = productData.description;
      if (productData.image !== undefined) updateData.image = productData.image || null;
      if (productData.model3d !== undefined) updateData.model_3d = productData.model3d || null;
      if (productData.arModel !== undefined) updateData.ar_model = productData.arModel || null;
      if (productData.specifications) updateData.specifications = productData.specifications;
      if (productData.price !== undefined) updateData.price = productData.price;
      if (productData.isActive !== undefined) updateData.is_active = productData.isActive;

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  static async getNotifications(): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(notification => ({
        id: notification.id,
        userId: notification.user_id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        createdAt: notification.created_at
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }
}
