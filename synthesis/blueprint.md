# Blueprint: Gemini API Bridge (#004-SYN)

## 1. Účel (Purpose)
Gemini API Bridge slouží jako bezpečný komunikační uzel mezi cloudovým AI Studiem a lokálním vývojovým prostředím architekta. Umožňuje synchronizaci kódu, čtení lokálních souborů a provádění příkazů v reálném čase pod dohledem koordinátora.

## 2. Technologický Stack
- **Framework:** Next.js 15 (App Router)
- **AI SDK:** Vercel AI SDK (pro streamování a orchestraci)
- **Runtime:** Node.js (pro přístup k FS)
- **Zabezpečení:** HMAC-SHA256 nebo Secret Key autorizace

## 3. Architektura Endpointu `/api/synthesis/bridge`
Endpoint bude fungovat jako obousměrný (stateless) komunikační bod.

### Request Structure (POST)
```json
{
  "secret_key": "SYNTHESIS_SECRET_KEY",
  "action": "read_file | write_file | list_dir | execute_command",
  "payload": {
    "path": "src/components/Button.tsx",
    "content": "...",
    "command": "npm run build"
  },
  "metadata": {
    "task_id": "#004-SYN",
    "timestamp": "2026-04-10T05:26:26Z"
  }
}
```

### Response Structure (JSON)
```json
{
  "status": "success | error",
  "data": {
    "content": "...",
    "output": "..."
  },
  "report": {
    "task_id": "#004-SYN",
    "last_commit": "a1b2c3d",
    "token_count": 1250,
    "active_file": "src/App.tsx",
    "timestamp": "2026-04-10T05:30:00Z"
  }
}
```

## 4. Bezpečnostní Protokol
1. **Autorizace:** Každý požadavek musí obsahovat `SYNTHESIS_SECRET_KEY` v hlavičce nebo těle.
2. **CORS:** Omezení pouze na povolené domény (AI Studio Preview).
3. **Sandbox:** Omezení přístupu k souborům pouze v rámci definovaného kořenového adresáře projektu.

## 5. File System Access
Most využívá nativní `fs/promises` pro asynchronní operace. Cesty jsou validovány proti "Path Traversal" útokům.
