# API-DOCS.md - Gantt Dashboard API Reference

> **Versie:** 1.0
> **Datum:** 2024-12-30
> **Deliverable:** D17
> **Status:** Complete

---

## Inhoudsopgave

1. [Overview](#1-overview)
2. [Workspace Endpoints](#2-workspace-endpoints)
3. [Project Endpoints](#3-project-endpoints)
4. [Vault Endpoints](#4-vault-endpoints)
5. [Export Endpoints](#5-export-endpoints)
6. [Error Reference](#6-error-reference)

---

## 1. Overview

### 1.1 Base URL

| Environment | Base URL |
|-------------|----------|
| **Production** | `https://gantt-dashboard.vercel.app/api` |
| **Staging** | `https://gantt-dashboard-staging.vercel.app/api` |
| **Development** | `http://localhost:3000/api` |

### 1.2 Authentication

Alle API requests vereisen authenticatie via Bearer token (Supabase JWT).

```bash
curl -H "Authorization: Bearer <your-jwt-token>" \
     https://gantt-dashboard.vercel.app/api/workspaces
```

#### Token verkrijgen via Supabase Auth

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Email/password login
const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'password'
});

// Token ophalen
const token = data.session?.access_token;

// Token vernieuwen
const { data: refreshData } = await supabase.auth.refreshSession();
```

#### Token in requests gebruiken

```javascript
// Fetch API
const response = await fetch('/api/workspaces', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});

// Axios
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

### 1.3 Rate Limits

| Endpoint Type | Limit | Window | Header |
|---------------|-------|--------|--------|
| **Read operations** | 100 requests | 1 minuut | `X-RateLimit-Read` |
| **Write operations** | 30 requests | 1 minuut | `X-RateLimit-Write` |
| **Sync operations** | 20 requests | 1 minuut | `X-RateLimit-Sync` |
| **Export operations** | 10 requests | 1 minuut | `X-RateLimit-Export` |

#### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200
```

#### Rate Limit Exceeded Response

```json
{
    "success": false,
    "error": {
        "code": "SRV_9003",
        "message": "Te veel verzoeken",
        "details": {
            "retryAfter": 45
        }
    }
}
```

### 1.4 Response Format

#### Success Response

```json
{
    "success": true,
    "data": {
        // Response data
    },
    "meta": {
        "total": 100,
        "page": 1,
        "pageSize": 20,
        "requestId": "req_abc123"
    }
}
```

#### Error Response

```json
{
    "success": false,
    "error": {
        "code": "RES_4001",
        "message": "Resource niet gevonden",
        "details": {
            "resourceType": "project",
            "resourceId": "123e4567-e89b-12d3-a456-426614174000"
        }
    }
}
```

### 1.5 Common HTTP Status Codes

| Status | Betekenis |
|--------|-----------|
| `200` | Succesvol |
| `201` | Resource aangemaakt |
| `204` | Succesvol, geen content |
| `400` | Ongeldige request |
| `401` | Niet geauthenticeerd |
| `403` | Niet geautoriseerd |
| `404` | Niet gevonden |
| `409` | Conflict |
| `422` | Validatie fout |
| `429` | Te veel requests |
| `500` | Server fout |

### 1.6 Pagination

```
GET /api/workspaces?page=1&pageSize=20
```

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | 1 | - | Paginanummer |
| `pageSize` | integer | 20 | 100 | Items per pagina |

Response meta:

```json
{
    "meta": {
        "total": 150,
        "page": 1,
        "pageSize": 20,
        "totalPages": 8,
        "hasNextPage": true,
        "hasPreviousPage": false
    }
}
```

---

## 2. Workspace Endpoints

### 2.1 List Workspaces

Retourneert alle workspaces waar de gebruiker toegang toe heeft.

```
GET /api/workspaces
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Nee | Filter op type: `afdeling` of `klant` |
| `archived` | boolean | Nee | Include archived workspaces (default: false) |
| `page` | integer | Nee | Pagina nummer |
| `pageSize` | integer | Nee | Items per pagina |

#### Response

```json
{
    "success": true,
    "data": {
        "workspaces": [
            {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "name": "Afdeling Engineering",
                "type": "afdeling",
                "description": "Technische projecten",
                "settings": {
                    "defaultView": "gantt",
                    "theme": "classic"
                },
                "archivedAt": null,
                "createdBy": "456e7890-e89b-12d3-a456-426614174000",
                "createdAt": "2024-01-15T10:30:00Z",
                "updatedAt": "2024-01-20T14:45:00Z",
                "memberCount": 8
            }
        ]
    },
    "meta": {
        "total": 5,
        "page": 1,
        "pageSize": 20
    }
}
```

#### Error Responses

| Code | Beschrijving |
|------|--------------|
| `401` | Niet geauthenticeerd |
| `500` | Server fout |

#### curl Voorbeeld

```bash
curl -X GET \
     -H "Authorization: Bearer $TOKEN" \
     "https://gantt-dashboard.vercel.app/api/workspaces?type=afdeling"
```

#### JavaScript Voorbeeld

```javascript
async function listWorkspaces(type?: 'afdeling' | 'klant') {
    const params = new URLSearchParams();
    if (type) params.append('type', type);

    const response = await fetch(`/api/workspaces?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const { data, meta } = await response.json();
    return { workspaces: data.workspaces, meta };
}
```

---

### 2.2 Create Workspace

Maakt een nieuwe workspace aan.

```
POST /api/workspaces
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Ja | Workspace naam (1-100 tekens) |
| `type` | string | Ja | `afdeling` of `klant` |
| `description` | string | Nee | Beschrijving (max 500 tekens) |
| `settings` | object | Nee | Workspace instellingen |

```json
{
    "name": "Nieuwe Afdeling",
    "type": "afdeling",
    "description": "Beschrijving van de afdeling",
    "settings": {
        "defaultView": "gantt",
        "theme": "classic",
        "features": {
            "vault": true,
            "export": true,
            "baselines": true
        }
    }
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "workspace": {
            "id": "789e0123-e89b-12d3-a456-426614174000",
            "name": "Nieuwe Afdeling",
            "type": "afdeling",
            "description": "Beschrijving van de afdeling",
            "settings": {
                "defaultView": "gantt",
                "theme": "classic",
                "features": {
                    "vault": true,
                    "export": true,
                    "baselines": true
                }
            },
            "createdBy": "456e7890-e89b-12d3-a456-426614174000",
            "createdAt": "2024-01-25T09:00:00Z",
            "updatedAt": "2024-01-25T09:00:00Z"
        }
    }
}
```

#### Error Responses

| Code | Error Code | Beschrijving |
|------|------------|--------------|
| `400` | `VAL_3001` | Validatie mislukt |
| `401` | `AUTH_1001` | Niet geauthenticeerd |
| `403` | `AUTHZ_2001` | Geen rechten om workspace te maken |
| `409` | `RES_4002` | Workspace met deze naam bestaat al |

#### curl Voorbeeld

```bash
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
         "name": "Nieuwe Afdeling",
         "type": "afdeling",
         "description": "Beschrijving"
     }' \
     https://gantt-dashboard.vercel.app/api/workspaces
```

#### JavaScript Voorbeeld

```javascript
async function createWorkspace(data: CreateWorkspaceRequest) {
    const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
    }

    const { data: result } = await response.json();
    return result.workspace;
}
```

---

### 2.3 Get Workspace

Haalt een specifieke workspace op met members.

```
GET /api/workspaces/:id
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Workspace ID |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `includeMembers` | boolean | Nee | Include members (default: true) |
| `includeProjects` | boolean | Nee | Include project count (default: false) |

#### Response

```json
{
    "success": true,
    "data": {
        "workspace": {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "name": "Afdeling Engineering",
            "type": "afdeling",
            "description": "Technische projecten",
            "settings": {
                "defaultView": "gantt"
            },
            "createdBy": "456e7890-e89b-12d3-a456-426614174000",
            "createdAt": "2024-01-15T10:30:00Z",
            "updatedAt": "2024-01-20T14:45:00Z"
        },
        "members": [
            {
                "id": "mem-001",
                "workspaceId": "123e4567-e89b-12d3-a456-426614174000",
                "userId": "456e7890-e89b-12d3-a456-426614174000",
                "role": "admin",
                "joinedAt": "2024-01-15T10:30:00Z",
                "user": {
                    "id": "456e7890-e89b-12d3-a456-426614174000",
                    "email": "admin@example.com",
                    "fullName": "Jan Jansen",
                    "avatarUrl": "https://..."
                }
            }
        ]
    }
}
```

#### Error Responses

| Code | Error Code | Beschrijving |
|------|------------|--------------|
| `401` | `AUTH_1001` | Niet geauthenticeerd |
| `403` | `AUTHZ_2003` | Geen toegang tot workspace |
| `404` | `RES_4001` | Workspace niet gevonden |

#### curl Voorbeeld

```bash
curl -X GET \
     -H "Authorization: Bearer $TOKEN" \
     "https://gantt-dashboard.vercel.app/api/workspaces/123e4567-e89b-12d3-a456-426614174000"
```

#### JavaScript Voorbeeld

```javascript
async function getWorkspace(id: string) {
    const response = await fetch(`/api/workspaces/${id}?includeMembers=true`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Workspace niet gevonden');
        }
        throw new Error('Fout bij ophalen workspace');
    }

    const { data } = await response.json();
    return data;
}
```

---

### 2.4 Update Workspace

Werkt workspace eigenschappen bij.

```
PUT /api/workspaces/:id
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Workspace ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Nee | Nieuwe naam (1-100 tekens) |
| `description` | string | Nee | Nieuwe beschrijving (max 500 tekens) |
| `settings` | object | Nee | Workspace instellingen (partial update) |

```json
{
    "name": "Engineering Team",
    "description": "Bijgewerkte beschrijving",
    "settings": {
        "defaultView": "calendar"
    }
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "workspace": {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "name": "Engineering Team",
            "type": "afdeling",
            "description": "Bijgewerkte beschrijving",
            "settings": {
                "defaultView": "calendar",
                "theme": "classic"
            },
            "updatedAt": "2024-01-25T11:30:00Z"
        }
    }
}
```

#### Error Responses

| Code | Error Code | Beschrijving |
|------|------------|--------------|
| `400` | `VAL_3001` | Validatie mislukt |
| `401` | `AUTH_1001` | Niet geauthenticeerd |
| `403` | `AUTHZ_2002` | Onvoldoende rechten |
| `404` | `RES_4001` | Workspace niet gevonden |

#### curl Voorbeeld

```bash
curl -X PUT \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "Engineering Team"}' \
     "https://gantt-dashboard.vercel.app/api/workspaces/123e4567-e89b-12d3-a456-426614174000"
```

#### JavaScript Voorbeeld

```javascript
async function updateWorkspace(id: string, data: UpdateWorkspaceRequest) {
    const response = await fetch(`/api/workspaces/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    if (!result.success) {
        throw new Error(result.error.message);
    }
    return result.data.workspace;
}
```

---

### 2.5 Delete Workspace

Archiveert een workspace (soft delete).

```
DELETE /api/workspaces/:id
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Workspace ID |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `permanent` | boolean | Nee | Permanent verwijderen (alleen admin) |

#### Response

```json
{
    "success": true,
    "data": {
        "message": "Workspace gearchiveerd",
        "archivedAt": "2024-01-25T12:00:00Z"
    }
}
```

#### Error Responses

| Code | Error Code | Beschrijving |
|------|------------|--------------|
| `401` | `AUTH_1001` | Niet geauthenticeerd |
| `403` | `AUTHZ_2002` | Onvoldoende rechten (admin vereist) |
| `404` | `RES_4001` | Workspace niet gevonden |
| `409` | `RES_4004` | Workspace heeft actieve projecten |

#### curl Voorbeeld

```bash
curl -X DELETE \
     -H "Authorization: Bearer $TOKEN" \
     "https://gantt-dashboard.vercel.app/api/workspaces/123e4567-e89b-12d3-a456-426614174000"
```

#### JavaScript Voorbeeld

```javascript
async function deleteWorkspace(id: string, permanent = false) {
    const params = permanent ? '?permanent=true' : '';
    const response = await fetch(`/api/workspaces/${id}${params}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
    }

    return true;
}
```

---

### 2.6 List Workspace Members

Haalt alle members van een workspace op.

```
GET /api/workspaces/:id/members
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Workspace ID |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | string | Nee | Filter op rol |

#### Response

```json
{
    "success": true,
    "data": {
        "members": [
            {
                "id": "mem-001",
                "workspaceId": "123e4567-e89b-12d3-a456-426614174000",
                "userId": "456e7890-e89b-12d3-a456-426614174000",
                "role": "admin",
                "joinedAt": "2024-01-15T10:30:00Z",
                "user": {
                    "id": "456e7890-e89b-12d3-a456-426614174000",
                    "email": "admin@example.com",
                    "fullName": "Jan Jansen",
                    "avatarUrl": "https://..."
                }
            },
            {
                "id": "mem-002",
                "workspaceId": "123e4567-e89b-12d3-a456-426614174000",
                "userId": "567e8901-e89b-12d3-a456-426614174000",
                "role": "medewerker",
                "joinedAt": "2024-01-16T09:00:00Z",
                "user": {
                    "id": "567e8901-e89b-12d3-a456-426614174000",
                    "email": "medewerker@example.com",
                    "fullName": "Piet Pietersen",
                    "avatarUrl": null
                }
            }
        ]
    },
    "meta": {
        "total": 2
    }
}
```

#### curl Voorbeeld

```bash
curl -X GET \
     -H "Authorization: Bearer $TOKEN" \
     "https://gantt-dashboard.vercel.app/api/workspaces/123e4567-e89b-12d3-a456-426614174000/members"
```

#### JavaScript Voorbeeld

```javascript
async function getWorkspaceMembers(workspaceId: string) {
    const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const { data } = await response.json();
    return data.members;
}
```

---

### 2.7 Add Workspace Member

Voegt een bestaande gebruiker toe aan workspace.

```
POST /api/workspaces/:id/members
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Workspace ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | UUID | Ja | Gebruiker ID |
| `role` | string | Ja | Rol: `admin`, `vault_medewerker`, `medewerker`, `klant_editor`, `klant_viewer` |

```json
{
    "userId": "678e9012-e89b-12d3-a456-426614174000",
    "role": "medewerker"
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "member": {
            "id": "mem-003",
            "workspaceId": "123e4567-e89b-12d3-a456-426614174000",
            "userId": "678e9012-e89b-12d3-a456-426614174000",
            "role": "medewerker",
            "joinedAt": "2024-01-25T14:00:00Z"
        }
    }
}
```

#### Error Responses

| Code | Error Code | Beschrijving |
|------|------------|--------------|
| `400` | `VAL_3001` | Ongeldige rol |
| `401` | `AUTH_1001` | Niet geauthenticeerd |
| `403` | `AUTHZ_2002` | Onvoldoende rechten |
| `404` | `RES_4001` | Workspace of gebruiker niet gevonden |
| `409` | `RES_4002` | Gebruiker is al member |

#### curl Voorbeeld

```bash
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"userId": "678e9012-e89b-12d3-a456-426614174000", "role": "medewerker"}' \
     "https://gantt-dashboard.vercel.app/api/workspaces/123e4567-e89b-12d3-a456-426614174000/members"
```

---

### 2.8 Remove Workspace Member

Verwijdert een member uit workspace.

```
DELETE /api/workspaces/:id/members/:userId
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Workspace ID |
| `userId` | UUID | Gebruiker ID |

#### Response

```json
{
    "success": true,
    "data": {
        "message": "Lid verwijderd uit workspace"
    }
}
```

#### Error Responses

| Code | Error Code | Beschrijving |
|------|------------|--------------|
| `401` | `AUTH_1001` | Niet geauthenticeerd |
| `403` | `AUTHZ_2002` | Onvoldoende rechten |
| `404` | `RES_4001` | Member niet gevonden |
| `409` | `RES_4003` | Kan laatste admin niet verwijderen |

#### curl Voorbeeld

```bash
curl -X DELETE \
     -H "Authorization: Bearer $TOKEN" \
     "https://gantt-dashboard.vercel.app/api/workspaces/123e4567-e89b-12d3-a456-426614174000/members/678e9012-e89b-12d3-a456-426614174000"
```

---

### 2.9 Invite Workspace Member

Stuurt een uitnodiging naar een nieuw lid.

```
POST /api/workspaces/:id/invites
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Workspace ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Ja | E-mailadres |
| `role` | string | Ja | Rol voor het nieuwe lid |
| `message` | string | Nee | Persoonlijk bericht in uitnodiging |

```json
{
    "email": "newuser@example.com",
    "role": "medewerker",
    "message": "Welkom bij ons team!"
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "invite": {
            "id": "inv-001",
            "workspaceId": "123e4567-e89b-12d3-a456-426614174000",
            "email": "newuser@example.com",
            "role": "medewerker",
            "status": "pending",
            "expiresAt": "2024-02-01T14:00:00Z",
            "createdAt": "2024-01-25T14:00:00Z"
        }
    }
}
```

#### Error Responses

| Code | Error Code | Beschrijving |
|------|------------|--------------|
| `400` | `VAL_3003` | Ongeldig e-mailadres |
| `401` | `AUTH_1001` | Niet geauthenticeerd |
| `403` | `AUTHZ_2002` | Onvoldoende rechten |
| `409` | `RES_4002` | Uitnodiging bestaat al |

#### curl Voorbeeld

```bash
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"email": "newuser@example.com", "role": "medewerker"}' \
     "https://gantt-dashboard.vercel.app/api/workspaces/123e4567-e89b-12d3-a456-426614174000/invites"
```

#### JavaScript Voorbeeld

```javascript
async function inviteMember(workspaceId: string, email: string, role: string) {
    const response = await fetch(`/api/workspaces/${workspaceId}/invites`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, role })
    });

    const result = await response.json();
    if (!result.success) {
        throw new Error(result.error.message);
    }
    return result.data.invite;
}
```

---

## 3. Project Endpoints

### 3.1 List Projects

Haalt projecten op voor een workspace.

```
GET /api/projects
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | UUID | Ja | Filter op workspace |
| `status` | string | Nee | `draft`, `active`, `completed`, `archived` |
| `page` | integer | Nee | Pagina nummer |
| `pageSize` | integer | Nee | Items per pagina |

#### Response

```json
{
    "success": true,
    "data": {
        "projects": [
            {
                "id": "proj-001",
                "workspaceId": "123e4567-e89b-12d3-a456-426614174000",
                "name": "Website Redesign",
                "description": "Complete redesign van de corporate website",
                "startDate": "2024-02-01",
                "endDate": "2024-05-31",
                "status": "active",
                "settings": {
                    "calendarId": "cal-001",
                    "hoursPerDay": 8,
                    "daysPerWeek": 5,
                    "skipWeekends": true
                },
                "createdBy": "456e7890-e89b-12d3-a456-426614174000",
                "createdAt": "2024-01-20T10:00:00Z",
                "updatedAt": "2024-01-25T15:30:00Z",
                "taskCount": 45,
                "percentComplete": 35
            }
        ]
    },
    "meta": {
        "total": 12,
        "page": 1,
        "pageSize": 20
    }
}
```

#### curl Voorbeeld

```bash
curl -X GET \
     -H "Authorization: Bearer $TOKEN" \
     "https://gantt-dashboard.vercel.app/api/projects?workspaceId=123e4567-e89b-12d3-a456-426614174000&status=active"
```

#### JavaScript Voorbeeld

```javascript
async function listProjects(workspaceId: string, status?: string) {
    const params = new URLSearchParams({ workspaceId });
    if (status) params.append('status', status);

    const response = await fetch(`/api/projects?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const { data, meta } = await response.json();
    return { projects: data.projects, meta };
}
```

---

### 3.2 Create Project

Maakt een nieuw project aan.

```
POST /api/projects
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `workspaceId` | UUID | Ja | Workspace ID |
| `name` | string | Ja | Projectnaam (1-100 tekens) |
| `description` | string | Nee | Beschrijving (max 1000 tekens) |
| `startDate` | string | Nee | Startdatum (ISO 8601) |
| `endDate` | string | Nee | Einddatum (ISO 8601) |
| `settings` | object | Nee | Project instellingen |

```json
{
    "workspaceId": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Nieuw Project",
    "description": "Projectbeschrijving",
    "startDate": "2024-02-01",
    "endDate": "2024-06-30",
    "settings": {
        "hoursPerDay": 8,
        "daysPerWeek": 5,
        "skipWeekends": true
    }
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "project": {
            "id": "proj-002",
            "workspaceId": "123e4567-e89b-12d3-a456-426614174000",
            "name": "Nieuw Project",
            "description": "Projectbeschrijving",
            "startDate": "2024-02-01",
            "endDate": "2024-06-30",
            "status": "draft",
            "settings": {
                "hoursPerDay": 8,
                "daysPerWeek": 5,
                "skipWeekends": true
            },
            "createdBy": "456e7890-e89b-12d3-a456-426614174000",
            "createdAt": "2024-01-25T16:00:00Z",
            "updatedAt": "2024-01-25T16:00:00Z"
        }
    }
}
```

#### curl Voorbeeld

```bash
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
         "workspaceId": "123e4567-e89b-12d3-a456-426614174000",
         "name": "Nieuw Project",
         "startDate": "2024-02-01"
     }' \
     https://gantt-dashboard.vercel.app/api/projects
```

---

### 3.3 Get Project

Haalt project details op.

```
GET /api/projects/:id
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Project ID |

#### Response

```json
{
    "success": true,
    "data": {
        "project": {
            "id": "proj-001",
            "workspaceId": "123e4567-e89b-12d3-a456-426614174000",
            "name": "Website Redesign",
            "description": "Complete redesign",
            "startDate": "2024-02-01",
            "endDate": "2024-05-31",
            "status": "active",
            "settings": {
                "calendarId": "cal-001",
                "hoursPerDay": 8
            },
            "createdAt": "2024-01-20T10:00:00Z",
            "updatedAt": "2024-01-25T15:30:00Z"
        },
        "stats": {
            "taskCount": 45,
            "completedTasks": 16,
            "percentComplete": 35,
            "resourceCount": 8
        }
    }
}
```

#### curl Voorbeeld

```bash
curl -X GET \
     -H "Authorization: Bearer $TOKEN" \
     "https://gantt-dashboard.vercel.app/api/projects/proj-001"
```

---

### 3.4 Update Project

Werkt project eigenschappen bij.

```
PUT /api/projects/:id
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Project ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Nee | Nieuwe naam |
| `description` | string | Nee | Nieuwe beschrijving |
| `startDate` | string | Nee | Nieuwe startdatum |
| `endDate` | string | Nee | Nieuwe einddatum |
| `status` | string | Nee | Nieuwe status |
| `settings` | object | Nee | Nieuwe instellingen |

```json
{
    "name": "Website Redesign v2",
    "status": "active",
    "endDate": "2024-06-30"
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "project": {
            "id": "proj-001",
            "name": "Website Redesign v2",
            "status": "active",
            "endDate": "2024-06-30",
            "updatedAt": "2024-01-25T17:00:00Z"
        }
    }
}
```

#### curl Voorbeeld

```bash
curl -X PUT \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"status": "active"}' \
     "https://gantt-dashboard.vercel.app/api/projects/proj-001"
```

---

### 3.5 Delete Project

Archiveert een project.

```
DELETE /api/projects/:id
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Project ID |

#### Response

```json
{
    "success": true,
    "data": {
        "message": "Project gearchiveerd"
    }
}
```

---

### 3.6 Sync Project Data (CrudManager)

Hoofdendpoint voor Bryntum CrudManager synchronisatie.

```
POST /api/projects/:id/sync
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Project ID |

#### Request Body - Load

```json
{
    "requestId": "12345",
    "type": "load"
}
```

#### Response - Load

```json
{
    "requestId": "12345",
    "success": true,
    "project": {
        "startDate": "2024-02-01",
        "hoursPerDay": 8,
        "daysPerWeek": 5
    },
    "tasks": {
        "rows": [
            {
                "id": "task-001",
                "parentId": null,
                "name": "Fase 1: Planning",
                "startDate": "2024-02-01T09:00:00Z",
                "endDate": "2024-02-15T17:00:00Z",
                "duration": 10,
                "durationUnit": "day",
                "percentDone": 100,
                "expanded": true,
                "children": true
            },
            {
                "id": "task-002",
                "parentId": "task-001",
                "name": "Requirements gathering",
                "startDate": "2024-02-01T09:00:00Z",
                "endDate": "2024-02-05T17:00:00Z",
                "duration": 3,
                "durationUnit": "day",
                "percentDone": 100
            }
        ]
    },
    "dependencies": {
        "rows": [
            {
                "id": "dep-001",
                "fromTask": "task-002",
                "toTask": "task-003",
                "type": 2,
                "lag": 0,
                "lagUnit": "day"
            }
        ]
    },
    "resources": {
        "rows": [
            {
                "id": "res-001",
                "name": "Jan Jansen",
                "type": "human",
                "image": "https://..."
            }
        ]
    },
    "assignments": {
        "rows": [
            {
                "id": "assign-001",
                "event": "task-002",
                "resource": "res-001",
                "units": 100
            }
        ]
    },
    "calendars": {
        "rows": [
            {
                "id": "cal-001",
                "name": "Standaard",
                "hoursPerDay": 8,
                "intervals": [
                    {
                        "recurrentStartDate": "on Sat at 0:00",
                        "recurrentEndDate": "on Mon at 0:00",
                        "isWorking": false
                    }
                ]
            }
        ]
    }
}
```

#### Request Body - Sync

```json
{
    "requestId": "12346",
    "type": "sync",
    "tasks": {
        "added": [
            {
                "$PhantomId": "phantom-1",
                "name": "Nieuwe Taak",
                "parentId": "task-001",
                "startDate": "2024-02-10T09:00:00Z",
                "duration": 5,
                "durationUnit": "day"
            }
        ],
        "updated": [
            {
                "id": "task-002",
                "percentDone": 75
            }
        ],
        "removed": [
            { "id": "task-old" }
        ]
    },
    "dependencies": {
        "added": [
            {
                "$PhantomId": "phantom-dep-1",
                "fromTask": "phantom-1",
                "toTask": "task-003",
                "type": 2
            }
        ]
    },
    "assignments": {
        "added": [
            {
                "$PhantomId": "phantom-assign-1",
                "event": "phantom-1",
                "resource": "res-001",
                "units": 50
            }
        ]
    }
}
```

#### Response - Sync

```json
{
    "requestId": "12346",
    "success": true,
    "tasks": {
        "rows": [
            {
                "$PhantomId": "phantom-1",
                "id": "task-new-001",
                "name": "Nieuwe Taak",
                "startDate": "2024-02-10T09:00:00Z",
                "endDate": "2024-02-14T17:00:00Z",
                "duration": 5,
                "wbsCode": "1.3"
            }
        ],
        "removed": ["task-old"]
    },
    "dependencies": {
        "rows": [
            {
                "$PhantomId": "phantom-dep-1",
                "id": "dep-new-001",
                "fromTask": "task-new-001",
                "toTask": "task-003"
            }
        ]
    },
    "assignments": {
        "rows": [
            {
                "$PhantomId": "phantom-assign-1",
                "id": "assign-new-001",
                "event": "task-new-001",
                "resource": "res-001"
            }
        ]
    }
}
```

#### Error Responses

| Code | Error Code | Beschrijving |
|------|------------|--------------|
| `400` | `SYNC_5001` | Ongeldige sync data |
| `401` | `AUTH_1001` | Niet geauthenticeerd |
| `403` | `AUTHZ_2004` | Geen toegang tot project |
| `409` | `SYNC_5002` | Sync conflict (concurrent edit) |
| `504` | `SYNC_5003` | Sync timeout |

#### curl Voorbeeld - Load

```bash
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"requestId": "12345", "type": "load"}' \
     "https://gantt-dashboard.vercel.app/api/projects/proj-001/sync"
```

#### JavaScript Voorbeeld - Bryntum Integration

```javascript
import { ProjectModel } from '@bryntum/gantt';

// Configureer ProjectModel voor automatische sync
const project = new ProjectModel({
    autoLoad: true,
    autoSync: true,
    validateResponse: true,

    transport: {
        load: {
            url: `/api/projects/${projectId}/sync`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            fetchOptions: {
                credentials: 'include'
            }
        },
        sync: {
            url: `/api/projects/${projectId}/sync`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    },

    listeners: {
        beforeSync: ({ pack }) => {
            console.log('Syncing changes:', pack);
        },
        sync: ({ response }) => {
            console.log('Sync complete:', response);
        },
        syncFail: ({ response }) => {
            console.error('Sync failed:', response);
        }
    }
});
```

---

### 3.7 Create Baseline

Maakt een baseline snapshot van het project.

```
POST /api/projects/:id/baseline
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Project ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Nee | Baseline naam |
| `description` | string | Nee | Beschrijving |

```json
{
    "name": "Baseline Week 4",
    "description": "Snapshot na planning fase"
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "baseline": {
            "id": "baseline-001",
            "projectId": "proj-001",
            "name": "Baseline Week 4",
            "description": "Snapshot na planning fase",
            "taskCount": 45,
            "createdAt": "2024-01-25T18:00:00Z"
        }
    }
}
```

#### curl Voorbeeld

```bash
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "Baseline Week 4"}' \
     "https://gantt-dashboard.vercel.app/api/projects/proj-001/baseline"
```

#### JavaScript Voorbeeld

```javascript
async function createBaseline(projectId: string, name?: string) {
    const response = await fetch(`/api/projects/${projectId}/baseline`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
    });

    const { data } = await response.json();
    return data.baseline;
}
```

---

### 3.8 Complete Project

Markeert project als voltooid en maakt Vault item.

```
POST /api/projects/:id/complete
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Project ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `notes` | string | Nee | Afrondingsnotities |
| `createVaultItem` | boolean | Nee | Maak Vault item (default: true) |

```json
{
    "notes": "Project succesvol afgerond",
    "createVaultItem": true
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "project": {
            "id": "proj-001",
            "status": "completed",
            "completedAt": "2024-01-25T19:00:00Z"
        },
        "vaultItem": {
            "id": "vault-001",
            "workspaceId": "123e4567-e89b-12d3-a456-426614174000",
            "projectId": "proj-001",
            "status": "input"
        }
    }
}
```

#### curl Voorbeeld

```bash
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"notes": "Project afgerond", "createVaultItem": true}' \
     "https://gantt-dashboard.vercel.app/api/projects/proj-001/complete"
```

---

## 4. Vault Endpoints

### 4.1 List Vault Items

Haalt vault items op. Vereist `admin` of `vault_medewerker` rol.

```
GET /api/vault
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | UUID | Nee | Filter op workspace |
| `status` | string | Nee | `input`, `processing`, `done` |
| `processedBy` | UUID | Nee | Filter op verwerker |
| `page` | integer | Nee | Pagina nummer |
| `pageSize` | integer | Nee | Items per pagina |

#### Response

```json
{
    "success": true,
    "data": {
        "items": [
            {
                "id": "vault-001",
                "workspaceId": "123e4567-e89b-12d3-a456-426614174000",
                "projectId": "proj-001",
                "sourceData": {
                    "projectName": "Website Redesign",
                    "taskCount": 45,
                    "totalHours": 320
                },
                "status": "input",
                "processingNotes": null,
                "processedBy": null,
                "processedAt": null,
                "doneAt": null,
                "expiresAt": "2024-02-24T19:00:00Z",
                "createdAt": "2024-01-25T19:00:00Z",
                "updatedAt": "2024-01-25T19:00:00Z",
                "workspace": {
                    "id": "123e4567-e89b-12d3-a456-426614174000",
                    "name": "Afdeling Engineering"
                },
                "project": {
                    "id": "proj-001",
                    "name": "Website Redesign"
                }
            }
        ]
    },
    "meta": {
        "total": 15,
        "page": 1,
        "pageSize": 20,
        "statusCounts": {
            "input": 5,
            "processing": 3,
            "done": 7
        }
    }
}
```

#### Error Responses

| Code | Error Code | Beschrijving |
|------|------------|--------------|
| `401` | `AUTH_1001` | Niet geauthenticeerd |
| `403` | `AUTHZ_2005` | Geen Vault toegang |

#### curl Voorbeeld

```bash
curl -X GET \
     -H "Authorization: Bearer $TOKEN" \
     "https://gantt-dashboard.vercel.app/api/vault?status=input"
```

#### JavaScript Voorbeeld

```javascript
async function listVaultItems(filters?: VaultFilters) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.workspaceId) params.append('workspaceId', filters.workspaceId);

    const response = await fetch(`/api/vault?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const { data, meta } = await response.json();
    return { items: data.items, meta };
}
```

---

### 4.2 Get Vault Item

Haalt een specifiek vault item op met volledige source data.

```
GET /api/vault/:id
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Vault item ID |

#### Response

```json
{
    "success": true,
    "data": {
        "item": {
            "id": "vault-001",
            "workspaceId": "123e4567-e89b-12d3-a456-426614174000",
            "projectId": "proj-001",
            "sourceData": {
                "projectName": "Website Redesign",
                "projectDescription": "Complete redesign",
                "startDate": "2024-02-01",
                "endDate": "2024-05-31",
                "tasks": [
                    {
                        "id": "task-001",
                        "name": "Fase 1: Planning",
                        "startDate": "2024-02-01",
                        "endDate": "2024-02-15",
                        "percentDone": 100
                    }
                ],
                "resources": [
                    {
                        "id": "res-001",
                        "name": "Jan Jansen",
                        "totalHours": 80
                    }
                ],
                "summary": {
                    "taskCount": 45,
                    "completedTasks": 45,
                    "totalHours": 320,
                    "totalCost": 25600
                }
            },
            "status": "input",
            "processingNotes": null,
            "processedBy": null,
            "expiresAt": "2024-02-24T19:00:00Z",
            "createdAt": "2024-01-25T19:00:00Z"
        },
        "workspace": {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "name": "Afdeling Engineering"
        },
        "project": {
            "id": "proj-001",
            "name": "Website Redesign"
        }
    }
}
```

#### curl Voorbeeld

```bash
curl -X GET \
     -H "Authorization: Bearer $TOKEN" \
     "https://gantt-dashboard.vercel.app/api/vault/vault-001"
```

---

### 4.3 Update Vault Item

Werkt vault item bij (status, notes).

```
PUT /api/vault/:id
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Vault item ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Nee | Nieuwe status |
| `processingNotes` | string | Nee | Verwerkingsnotities |

```json
{
    "status": "processing",
    "processingNotes": "Gegevens worden gevalideerd"
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "item": {
            "id": "vault-001",
            "status": "processing",
            "processingNotes": "Gegevens worden gevalideerd",
            "processedBy": "456e7890-e89b-12d3-a456-426614174000",
            "processedAt": "2024-01-25T20:00:00Z",
            "updatedAt": "2024-01-25T20:00:00Z"
        }
    }
}
```

#### curl Voorbeeld

```bash
curl -X PUT \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"status": "processing", "processingNotes": "In behandeling"}' \
     "https://gantt-dashboard.vercel.app/api/vault/vault-001"
```

---

### 4.4 Process Vault Item

Verplaatst item van Input naar Processing.

```
POST /api/vault/:id/process
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Vault item ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `notes` | string | Nee | Startnotities |

```json
{
    "notes": "Start verwerking: data validatie"
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "item": {
            "id": "vault-001",
            "status": "processing",
            "processingNotes": "Start verwerking: data validatie",
            "processedBy": "456e7890-e89b-12d3-a456-426614174000",
            "processedAt": "2024-01-25T20:30:00Z"
        }
    }
}
```

#### Error Responses

| Code | Error Code | Beschrijving |
|------|------------|--------------|
| `400` | `VAL_3001` | Item is niet in 'input' status |
| `403` | `AUTHZ_2005` | Geen Vault toegang |
| `404` | `RES_4001` | Item niet gevonden |

#### curl Voorbeeld

```bash
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"notes": "Start verwerking"}' \
     "https://gantt-dashboard.vercel.app/api/vault/vault-001/process"
```

---

### 4.5 Export Vault Item

Exporteert verwerkt item naar permanente opslag.

```
POST /api/vault/:id/export
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Vault item ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `destination` | string | Nee | `permanent` (default) of `archive` |
| `format` | string | Nee | Export formaat: `json`, `excel` |
| `includeAttachments` | boolean | Nee | Bijlagen meenemen |

```json
{
    "destination": "permanent",
    "format": "excel",
    "includeAttachments": true
}
```

#### Response

```json
{
    "success": true,
    "data": {
        "item": {
            "id": "vault-001",
            "status": "done",
            "doneAt": "2024-01-25T21:00:00Z",
            "exportedAt": "2024-01-25T21:00:00Z"
        },
        "export": {
            "id": "export-001",
            "url": "https://storage.supabase.co/...",
            "format": "excel",
            "size": 156800,
            "expiresAt": "2024-02-01T21:00:00Z"
        }
    }
}
```

#### Error Responses

| Code | Error Code | Beschrijving |
|------|------------|--------------|
| `400` | `VAL_3001` | Item is niet in 'processing' status |
| `403` | `AUTHZ_2005` | Geen Vault toegang |
| `500` | `EXPORT_6001` | Export mislukt |

#### curl Voorbeeld

```bash
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"destination": "permanent", "format": "excel"}' \
     "https://gantt-dashboard.vercel.app/api/vault/vault-001/export"
```

#### JavaScript Voorbeeld

```javascript
async function exportVaultItem(id: string, options?: ExportOptions) {
    const response = await fetch(`/api/vault/${id}/export`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(options || {})
    });

    const result = await response.json();
    if (!result.success) {
        throw new Error(result.error.message);
    }

    // Download de export
    if (result.data.export.url) {
        window.open(result.data.export.url, '_blank');
    }

    return result.data;
}
```

---

## 5. Export Endpoints

### 5.1 PDF Export

Genereert PDF export van Gantt of Calendar view.

```
POST /api/export/pdf
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `projectId` | UUID | Ja | Project ID |
| `type` | string | Ja | `gantt`, `calendar`, `taskboard` |
| `options` | object | Nee | Export opties |

#### Options Object

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `orientation` | string | `landscape` | `portrait` of `landscape` |
| `paperSize` | string | `A4` | `A4`, `A3`, `letter`, `legal` |
| `scale` | number | 1 | Schaal factor (0.5 - 2) |
| `dateRange` | object | null | Start/end datum filter |
| `includeBaseline` | boolean | false | Baseline weergeven |
| `includeCriticalPath` | boolean | false | Kritieke pad markeren |
| `headerText` | string | null | Custom header tekst |
| `footerText` | string | null | Custom footer tekst |

```json
{
    "projectId": "proj-001",
    "type": "gantt",
    "options": {
        "orientation": "landscape",
        "paperSize": "A3",
        "scale": 0.8,
        "dateRange": {
            "startDate": "2024-02-01",
            "endDate": "2024-03-31"
        },
        "includeCriticalPath": true,
        "headerText": "Website Redesign Project",
        "footerText": "Gegenereerd op {date}"
    }
}
```

#### Response

```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="project-gantt-2024-01-25.pdf"
Content-Length: 245678

[Binary PDF data]
```

#### Error Responses

| Code | Error Code | Beschrijving |
|------|------------|--------------|
| `400` | `VAL_3001` | Ongeldige export opties |
| `403` | `AUTHZ_2004` | Geen toegang tot project |
| `408` | `EXPORT_6002` | Export timeout |
| `413` | `EXPORT_6003` | Export te groot |

#### curl Voorbeeld

```bash
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
         "projectId": "proj-001",
         "type": "gantt",
         "options": {"orientation": "landscape", "paperSize": "A3"}
     }' \
     --output project-export.pdf \
     "https://gantt-dashboard.vercel.app/api/export/pdf"
```

#### JavaScript Voorbeeld

```javascript
async function exportToPdf(projectId: string, options?: PdfExportOptions) {
    const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            projectId,
            type: 'gantt',
            options
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
    }

    // Download PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${projectId}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
}
```

---

### 5.2 Excel Export

Genereert Excel export van project data.

```
POST /api/export/excel
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `projectId` | UUID | Ja | Project ID |
| `options` | object | Nee | Export opties |

#### Options Object

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `sheets` | array | `['tasks']` | Sheets: `tasks`, `resources`, `assignments`, `dependencies` |
| `columns` | object | null | Kolommen per sheet |
| `includeHeaders` | boolean | true | Headers toevoegen |
| `dateFormat` | string | `DD-MM-YYYY` | Datum formaat |
| `includeFormulas` | boolean | false | Berekeningsformules |

```json
{
    "projectId": "proj-001",
    "options": {
        "sheets": ["tasks", "resources", "assignments"],
        "columns": {
            "tasks": ["wbsCode", "name", "startDate", "endDate", "duration", "percentDone", "resources"],
            "resources": ["name", "type", "costPerHour"]
        },
        "includeHeaders": true,
        "dateFormat": "DD-MM-YYYY"
    }
}
```

#### Response

```
HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="project-data-2024-01-25.xlsx"
Content-Length: 45678

[Binary Excel data]
```

#### curl Voorbeeld

```bash
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
         "projectId": "proj-001",
         "options": {"sheets": ["tasks", "resources"]}
     }' \
     --output project-data.xlsx \
     "https://gantt-dashboard.vercel.app/api/export/excel"
```

#### JavaScript Voorbeeld

```javascript
async function exportToExcel(projectId: string, options?: ExcelExportOptions) {
    const response = await fetch('/api/export/excel', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectId, options })
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${projectId}.xlsx`;
    a.click();
}
```

---

### 5.3 CSV Export

Genereert CSV export van taakgegevens.

```
POST /api/export/csv
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `projectId` | UUID | Ja | Project ID |
| `options` | object | Nee | Export opties |

#### Options Object

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `columns` | array | all | Kolommen om te exporteren |
| `delimiter` | string | `,` | Scheidingsteken |
| `includeHeaders` | boolean | true | Headers toevoegen |
| `encoding` | string | `utf-8` | Character encoding |
| `dateFormat` | string | `YYYY-MM-DD` | Datum formaat |
| `flattenHierarchy` | boolean | false | Hiërarchie platslaan |

```json
{
    "projectId": "proj-001",
    "options": {
        "columns": ["wbsCode", "name", "startDate", "endDate", "duration", "percentDone"],
        "delimiter": ";",
        "includeHeaders": true,
        "encoding": "utf-8"
    }
}
```

#### Response

```
HTTP/1.1 200 OK
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="project-tasks-2024-01-25.csv"

wbsCode;name;startDate;endDate;duration;percentDone
1;Fase 1: Planning;2024-02-01;2024-02-15;10;100
1.1;Requirements gathering;2024-02-01;2024-02-05;3;100
```

#### curl Voorbeeld

```bash
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
         "projectId": "proj-001",
         "options": {"delimiter": ";"}
     }' \
     --output project-tasks.csv \
     "https://gantt-dashboard.vercel.app/api/export/csv"
```

---

### 5.4 Image Export

Genereert PNG of SVG afbeelding van de view.

```
POST /api/export/image
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `projectId` | UUID | Ja | Project ID |
| `type` | string | Ja | `gantt`, `calendar`, `taskboard` |
| `format` | string | Nee | `png` (default) of `svg` |
| `options` | object | Nee | Export opties |

#### Options Object

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `width` | number | 1920 | Breedte in pixels |
| `height` | number | 1080 | Hoogte in pixels |
| `scale` | number | 1 | DPI schaal (1-3) |
| `backgroundColor` | string | `#ffffff` | Achtergrondkleur |
| `dateRange` | object | null | Start/end datum filter |

```json
{
    "projectId": "proj-001",
    "type": "gantt",
    "format": "png",
    "options": {
        "width": 2560,
        "height": 1440,
        "scale": 2,
        "backgroundColor": "#ffffff",
        "dateRange": {
            "startDate": "2024-02-01",
            "endDate": "2024-03-31"
        }
    }
}
```

#### Response - PNG

```
HTTP/1.1 200 OK
Content-Type: image/png
Content-Disposition: attachment; filename="project-gantt-2024-01-25.png"

[Binary PNG data]
```

#### Response - SVG

```
HTTP/1.1 200 OK
Content-Type: image/svg+xml
Content-Disposition: attachment; filename="project-gantt-2024-01-25.svg"

<?xml version="1.0" encoding="UTF-8"?>
<svg ...>
```

#### curl Voorbeeld

```bash
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
         "projectId": "proj-001",
         "type": "gantt",
         "format": "png",
         "options": {"width": 2560, "height": 1440}
     }' \
     --output project-gantt.png \
     "https://gantt-dashboard.vercel.app/api/export/image"
```

#### JavaScript Voorbeeld

```javascript
async function exportToImage(
    projectId: string,
    type: 'gantt' | 'calendar' | 'taskboard',
    format: 'png' | 'svg' = 'png',
    options?: ImageExportOptions
) {
    const response = await fetch('/api/export/image', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectId, type, format, options })
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${type}.${format}`;
    a.click();
}
```

---

## 6. Error Reference

### 6.1 Error Code Overzicht

#### Authentication Errors (1xxx)

| Code | Naam | Beschrijving | HTTP Status |
|------|------|--------------|-------------|
| `AUTH_1001` | AUTH_REQUIRED | Authenticatie vereist | 401 |
| `AUTH_1002` | AUTH_INVALID_TOKEN | Ongeldig token | 401 |
| `AUTH_1003` | AUTH_EXPIRED_TOKEN | Verlopen token | 401 |
| `AUTH_1004` | AUTH_INVALID_CREDENTIALS | Ongeldige inloggegevens | 401 |

#### Authorization Errors (2xxx)

| Code | Naam | Beschrijving | HTTP Status |
|------|------|--------------|-------------|
| `AUTHZ_2001` | AUTHZ_FORBIDDEN | Toegang geweigerd | 403 |
| `AUTHZ_2002` | AUTHZ_INSUFFICIENT_ROLE | Onvoldoende rechten | 403 |
| `AUTHZ_2003` | AUTHZ_WORKSPACE_ACCESS_DENIED | Geen toegang tot workspace | 403 |
| `AUTHZ_2004` | AUTHZ_PROJECT_ACCESS_DENIED | Geen toegang tot project | 403 |
| `AUTHZ_2005` | AUTHZ_VAULT_ACCESS_DENIED | Geen toegang tot Vault | 403 |

#### Validation Errors (3xxx)

| Code | Naam | Beschrijving | HTTP Status |
|------|------|--------------|-------------|
| `VAL_3001` | VALIDATION_FAILED | Validatie mislukt | 400 |
| `VAL_3002` | VALIDATION_REQUIRED_FIELD | Verplicht veld ontbreekt | 400 |
| `VAL_3003` | VALIDATION_INVALID_FORMAT | Ongeldig formaat | 400 |
| `VAL_3004` | VALIDATION_OUT_OF_RANGE | Waarde buiten bereik | 400 |

#### Resource Errors (4xxx)

| Code | Naam | Beschrijving | HTTP Status |
|------|------|--------------|-------------|
| `RES_4001` | RESOURCE_NOT_FOUND | Resource niet gevonden | 404 |
| `RES_4002` | RESOURCE_ALREADY_EXISTS | Resource bestaat al | 409 |
| `RES_4003` | RESOURCE_CONFLICT | Conflict met bestaande resource | 409 |
| `RES_4004` | RESOURCE_DEPENDENCY | Resource heeft afhankelijkheden | 409 |

#### Sync Errors (5xxx)

| Code | Naam | Beschrijving | HTTP Status |
|------|------|--------------|-------------|
| `SYNC_5001` | SYNC_FAILED | Synchronisatie mislukt | 500 |
| `SYNC_5002` | SYNC_CONFLICT | Synchronisatie conflict | 409 |
| `SYNC_5003` | SYNC_TIMEOUT | Synchronisatie timeout | 504 |

#### Export Errors (6xxx)

| Code | Naam | Beschrijving | HTTP Status |
|------|------|--------------|-------------|
| `EXPORT_6001` | EXPORT_FAILED | Export mislukt | 500 |
| `EXPORT_6002` | EXPORT_TIMEOUT | Export timeout | 504 |
| `EXPORT_6003` | EXPORT_TOO_LARGE | Export te groot | 413 |

#### Server Errors (9xxx)

| Code | Naam | Beschrijving | HTTP Status |
|------|------|--------------|-------------|
| `SRV_9001` | SERVER_ERROR | Server fout | 500 |
| `SRV_9002` | SERVER_UNAVAILABLE | Server niet beschikbaar | 503 |
| `SRV_9003` | SERVER_RATE_LIMITED | Te veel verzoeken | 429 |

### 6.2 Error Response Format

```json
{
    "success": false,
    "error": {
        "code": "VAL_3001",
        "message": "Validatie mislukt",
        "details": {
            "field": "name",
            "constraint": "required",
            "value": null
        }
    },
    "meta": {
        "requestId": "req_abc123",
        "timestamp": "2024-01-25T22:00:00Z"
    }
}
```

### 6.3 Error Handling in JavaScript

```javascript
class ApiError extends Error {
    constructor(
        public code: string,
        message: string,
        public details?: Record<string, unknown>,
        public statusCode?: number
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });

    const data = await response.json();

    if (!data.success) {
        throw new ApiError(
            data.error.code,
            data.error.message,
            data.error.details,
            response.status
        );
    }

    return data.data;
}

// Gebruik
try {
    const workspace = await apiRequest<Workspace>('/api/workspaces/123');
} catch (error) {
    if (error instanceof ApiError) {
        switch (error.code) {
            case 'AUTH_1001':
                // Redirect naar login
                router.push('/login');
                break;
            case 'AUTHZ_2003':
                // Toon geen toegang melding
                toast.error('Je hebt geen toegang tot deze workspace');
                break;
            case 'RES_4001':
                // Resource niet gevonden
                toast.error('Workspace niet gevonden');
                break;
            default:
                toast.error(error.message);
        }
    }
}
```

---

## Appendix

### A. TypeScript Types

Zie [CONTRACTS.md](./CONTRACTS.md) voor complete TypeScript interface definities.

### B. Postman Collection

Download de Postman collection: [gantt-dashboard-api.postman_collection.json](./postman/gantt-dashboard-api.postman_collection.json)

### C. OpenAPI Specification

De OpenAPI 3.0 specificatie is beschikbaar op: [/api/docs](https://gantt-dashboard.vercel.app/api/docs)

### D. Related Documents

| Document | Beschrijving |
|----------|--------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Systeem architectuur |
| [CONTRACTS.md](./CONTRACTS.md) | TypeScript interfaces en contracts |
| [DELIVERABLES.md](../DELIVERABLES.md) | Project deliverables |

### E. Version History

| Versie | Datum | Auteur | Wijzigingen |
|--------|-------|--------|-------------|
| 1.0 | 2024-12-30 | A8 (Documenter) | Initial version |

---

*Document: D17 API-DOCS.md*
*Versie: 1.0*
*Laatst bijgewerkt: 30 December 2024*
