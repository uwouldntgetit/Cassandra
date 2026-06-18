export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Cassandra API',
    version: '1.0.0',
    description: 'REST API per il monitoraggio smart city di Trento. Fornisce dati in tempo reale su meteo, traffico, illuminazione e folla, oltre alla gestione utenti e pannello admin.'
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Sviluppo locale' },
    { url: 'https://cassandra-backend.onrender.com', description: 'Produzione (Render.com)' }
  ],
  tags: [
    { name: 'Auth',          description: 'Autenticazione e registrazione' },
    { name: 'Layers',        description: 'Dati layer in tempo reale (pubblici)' },
    { name: 'Routing',       description: 'Calcolo percorso stradale tra due punti (OSRM)' },
    { name: 'Predictions',   description: 'Previsioni meteo e affollamento' },
    { name: 'Notifications', description: 'Notifiche di sistema pubbliche' },
    { name: 'Users',         description: 'Profilo utente e luoghi preferiti (JWT richiesto)' },
    { name: 'Admin',         description: 'Pannello amministrativo (JWT + ruolo admin)' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT ottenuto dal login. Header: Authorization: Bearer <token>'
      }
    },
    schemas: {
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          token:   { type: 'string', description: 'JWT valido per 24 ore' },
          id:      { type: 'string' },
          name:    { type: 'string', example: 'Mario Rossi' },
          email:   { type: 'string', format: 'email' },
          role:    { type: 'string', enum: ['user', 'admin'] },
          self:    { type: 'string', example: '/api/v1/users/64abc...' }
        }
      },
      FavoritePlace: {
        type: 'object',
        description: 'Ricerca salvata: località più lo stato della mappa (layer attivi, giorno e fascia oraria)',
        properties: {
          _id:          { type: 'string' },
          name:         { type: 'string', example: 'Piazza Duomo' },
          display_name: { type: 'string', example: 'Piazza Duomo, Trento, Italia' },
          lat:          { type: 'number', example: 46.0679 },
          lon:          { type: 'number', example: 11.1211 },
          layers:       { type: 'array', items: { type: 'string', enum: ['weather', 'traffic', 'lighting', 'crowd'] }, example: ['weather', 'traffic'] },
          forecastDay:  { type: 'integer', minimum: 0, maximum: 6, example: 0 },
          timeSlot:     { type: 'integer', minimum: 0, maximum: 3, example: 0 }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' }
        }
      }
    }
  },
  paths: {
    '/api/v1/authentications': {
      post: {
        tags: ['Auth'],
        summary: 'Login con email e password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email:    { type: 'string', format: 'email', example: 'mario@example.com' },
                  password: { type: 'string', example: 'user123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login effettuato', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          400: { description: 'Campi mancanti o account Google-only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Credenziali non valide', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/api/v1/authentications/google': {
      post: {
        tags: ['Auth'],
        summary: 'Login con Google Identity Services',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['credential'],
                properties: {
                  credential: { type: 'string', description: 'JWT restituito da Google Identity Services' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login Google effettuato', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          400: { description: 'Credential mancante', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Token Google non valido', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          503: { description: 'Google Auth non configurato sul server', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/api/v1/authentications/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrazione nuovo utente',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name:     { type: 'string', example: 'Mario Rossi' },
                  email:    { type: 'string', format: 'email', example: 'mario@example.com' },
                  password: { type: 'string', minLength: 6, example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Utente creato', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, self: { type: 'string' } } } } } },
          400: { description: 'Dati mancanti o password troppo corta', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Email già registrata', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/api/v1/layers/weather': {
      get: {
        tags: ['Layers'],
        summary: 'Dati meteo in tempo reale',
        responses: { 200: { description: 'Condizioni meteo correnti per zona (Open-Meteo)' } }
      }
    },
    '/api/v1/layers/traffic': {
      get: {
        tags: ['Layers'],
        summary: 'Dati traffico stradale',
        responses: { 200: { description: 'Segmenti stradali con livello di traffico (Overpass/OSRM)' } }
      }
    },
    '/api/v1/layers/crowd': {
      get: {
        tags: ['Layers'],
        summary: 'Densità di affollamento per zona',
        responses: { 200: { description: 'Heatmap affollamento per le 12 zone di Trento' } }
      }
    },
    '/api/v1/layers/lighting': {
      get: {
        tags: ['Layers'],
        summary: 'Stato illuminazione pubblica',
        responses: { 200: { description: 'Heatmap illuminazione per le 12 zone di Trento' } }
      }
    },
    '/api/v1/routing': {
      get: {
        tags: ['Routing'],
        summary: 'Calcola il percorso stradale tra due punti',
        description: 'Restituisce distanza, durata e geometria del tragitto in auto tra origine e destinazione, calcolati tramite OSRM.',
        parameters: [
          { name: 'fromLat', in: 'query', required: true, schema: { type: 'number' }, example: 46.0723, description: 'Latitudine di partenza' },
          { name: 'fromLon', in: 'query', required: true, schema: { type: 'number' }, example: 11.1162, description: 'Longitudine di partenza' },
          { name: 'toLat',   in: 'query', required: true, schema: { type: 'number' }, example: 46.0660, description: 'Latitudine di destinazione' },
          { name: 'toLon',   in: 'query', required: true, schema: { type: 'number' }, example: 11.1498, description: 'Longitudine di destinazione' }
        ],
        responses: {
          200: {
            description: 'Percorso calcolato',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success:  { type: 'boolean', example: true },
                    distance: { type: 'integer', description: 'Distanza in metri', example: 3200 },
                    duration: { type: 'integer', description: 'Durata in secondi', example: 540 },
                    geometry: {
                      type: 'object',
                      description: 'GeoJSON LineString, coordinate [lon, lat]',
                      properties: {
                        type:        { type: 'string', example: 'LineString' },
                        coordinates: { type: 'array', items: { type: 'array', items: { type: 'number' } } }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { description: 'Coordinate mancanti o non valide', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Nessun percorso trovato tra i due punti', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          503: { description: 'Servizio di routing non disponibile', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/api/v1/predictions': {
      get: {
        tags: ['Predictions'],
        summary: 'Previsioni meteo e affollamento (7-14 giorni)',
        responses: { 200: { description: 'Array di previsioni giornaliere con meteo e stima folla' } }
      }
    },
    '/api/v1/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Notifiche di sistema pubbliche (ultimi 20 eventi)',
        responses: {
          200: {
            description: 'Lista eventi pubblici recenti',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      _id:       { type: 'string' },
                      type:      { type: 'string', enum: ['weather', 'traffic', 'crowd', 'lighting', 'sensor'] },
                      message:   { type: 'string' },
                      status:    { type: 'string', enum: ['Unresolved', 'Investigating', 'Resolved'] },
                      createdAt: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Profilo utente corrente',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dati profilo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id:        { type: 'string' },
                    name:      { type: 'string' },
                    email:     { type: 'string', format: 'email' },
                    role:      { type: 'string', enum: ['user', 'admin'] },
                    favorites: { type: 'array', items: { $ref: '#/components/schemas/FavoritePlace' } }
                  }
                }
              }
            }
          },
          401: { description: 'Token mancante' },
          403: { description: 'Token non valido' }
        }
      }
    },
    '/api/v1/users/me/favorites': {
      get: {
        tags: ['Users'],
        summary: 'Lista luoghi preferiti',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Array di luoghi preferiti', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/FavoritePlace' } } } } },
          401: { description: 'Token mancante' }
        }
      },
      post: {
        tags: ['Users'],
        summary: 'Aggiunge un luogo ai preferiti',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'lat', 'lon'],
                properties: {
                  name:         { type: 'string', example: 'Piazza Duomo' },
                  display_name: { type: 'string', example: 'Piazza Duomo, Trento, Italia' },
                  lat:          { type: 'number', example: 46.0679 },
                  lon:          { type: 'number', example: 11.1211 },
                  layers:       { type: 'array', items: { type: 'string', enum: ['weather', 'traffic', 'lighting', 'crowd'] }, example: ['weather', 'traffic'] },
                  forecastDay:  { type: 'integer', minimum: 0, maximum: 6, example: 0 },
                  timeSlot:     { type: 'integer', minimum: 0, maximum: 3, example: 0 }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Preferito aggiunto', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, favorite: { $ref: '#/components/schemas/FavoritePlace' } } } } } },
          400: { description: 'Campi mancanti' },
          409: { description: 'Luogo già in preferiti' }
        }
      }
    },
    '/api/v1/users/me/favorites/{id}': {
      delete: {
        tags: ['Users'],
        summary: 'Rimuove un luogo dai preferiti',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del preferito' }],
        responses: {
          204: { description: 'Preferito rimosso' },
          404: { description: 'Preferito non trovato' }
        }
      }
    },
    '/api/v1/admin/metrics': {
      get: {
        tags: ['Admin'],
        summary: 'Statistiche dashboard admin',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Metriche sistema',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    activeSensors:    { type: 'integer' },
                    totalSensors:     { type: 'integer' },
                    onlinePercentage: { type: 'integer' },
                    systemLoad:       { type: 'integer' },
                    activeAlerts:     { type: 'integer' },
                    totalUsers:       { type: 'integer' },
                    apiRequests:      { type: 'string' }
                  }
                }
              }
            }
          },
          401: { description: 'Token mancante' },
          403: { description: 'Accesso negato (non admin)' }
        }
      }
    },
    '/api/v1/admin/events': {
      get: {
        tags: ['Admin'],
        summary: 'Tutti gli eventi di sistema (ultimi 20)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista eventi con stato e tipo' } }
      }
    },
    '/api/v1/admin/events/{id}': {
      patch: {
        tags: ['Admin'],
        summary: 'Aggiorna stato di un evento',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: { status: { type: 'string', enum: ['Unresolved', 'Investigating', 'Resolved'] } }
              }
            }
          }
        },
        responses: {
          200: { description: 'Evento aggiornato' },
          400: { description: 'Status non valido' },
          404: { description: 'Evento non trovato' }
        }
      }
    },
    '/api/v1/admin/sensors': {
      get: {
        tags: ['Admin'],
        summary: 'Lista sensori IoT',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista sensori con stato e tipo' } }
      }
    },
    '/api/v1/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Lista tutti gli utenti registrati',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista utenti senza password' } }
      }
    }
  }
}
