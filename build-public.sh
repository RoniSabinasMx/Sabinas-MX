#!/bin/bash
echo "Generando config.js para producción..."

# Crear el directorio si no existe
mkdir -p config

# Crear el archivo inyectando las variables de Vercel
cat > config/config.js << EOF
window.SABINAS_CONFIG = {
  supabaseUrl: '${VITE_SUPABASE_URL}',
  supabaseKey: '${VITE_SUPABASE_ANON_KEY}'
};
EOF

echo "config.js generado exitosamente."
