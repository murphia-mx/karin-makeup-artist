import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("No se encontraron las variables de entorno de Supabase.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function audit() {
  console.log('--- INICIO DE AUDITORÍA DE INTEGRACIÓN ---');
  
  // 1. Verificación directa de tabla usando ANON KEY (debe fallar si RLS está activo y no permitiendo pending)
  console.log('\n[1] TEST: Consulta anónima a tabla reviews (status=pending)...');
  const { data: anonData, error: anonError } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', 'pending');
    
  if (anonError) {
    console.log('❌ Error (esperado si RLS funciona):', anonError.message);
  } else {
    console.log(`✅ Resultados anónimos: ${anonData?.length} filas devueltas (Esperado: 0 si RLS es estricto)`);
  }

  // 2. Intentar autenticación con el admin
  console.log('\n[2] TEST: Intentando login en Supabase con credenciales admin@karin.local...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@karin.local',
    password: 'admin123'
  });

  if (authError) {
    console.log('❌ Error de login (El admin no existe en Auth o credenciales incorrectas):', authError.message);
  } else {
    console.log(`✅ Login exitoso. UID: ${authData.user.id}`);
    
    // 3. Verificamos si este UID existe en user_roles con rol 'admin'
    console.log('\n[3] TEST: Verificando tabla user_roles para este usuario...');
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', authData.user.id);
      
    if (roleError) console.log('❌ Error roles:', roleError.message);
    else console.log('✅ Registros en user_roles:', JSON.stringify(roleData, null, 2));

    // 4. Repetir consulta de reseñas como admin
    console.log('\n[4] TEST: Consulta a reviews (status=pending) COMO ADMIN...');
    const { data: adminData, error: adminQueryError } = await supabase
      .from('reviews')
      .select('*, services(name, slug)')
      .eq('status', 'pending');
      
    if (adminQueryError) {
      console.log('❌ Error de consulta admin:', adminQueryError.message);
    } else {
      console.log(`✅ Resultados admin: ${adminData?.length} filas devueltas.`);
      if (adminData && adminData.length > 0) {
        console.log('Muestra del primer registro:', JSON.stringify(adminData[0], null, 2));
      }
    }
    
    // 5. Test del view de dashboard
    console.log('\n[5] TEST: Consultando el RPC get_dashboard_kpis()...');
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_dashboard_kpis');
    if (rpcError) {
      console.log('❌ Error en RPC get_dashboard_kpis:', rpcError.message);
    } else {
      console.log('✅ Respuesta RPC get_dashboard_kpis:', rpcData);
    }
  }
}

audit();
