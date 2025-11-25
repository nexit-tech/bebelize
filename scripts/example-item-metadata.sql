INSERT INTO items (
  id,
  collection_id,
  name,
  code,
  description,
  final_image_url,
  layers_metadata
) VALUES (
  'uuid-exemplo-item-1',
  'uuid-colecao-aviador',
  'Kit Berço Aviador 5pcs',
  'KIT-BERCO-AV-5',
  'Kit completo para berço com 5 peças tema aviador',
  'https://seu-projeto.supabase.co/storage/v1/object/public/bebelize-images/aviador/kit-berco-aviador-5pcs/preview.png',
  '{
    "item_id": "uuid-exemplo-item-1",
    "item_name": "Kit Berço Aviador 5pcs",
    "layers": [
      {
        "index": 1,
        "file": "1.png",
        "url": "https://seu-projeto.supabase.co/storage/v1/object/public/bebelize-images/aviador/kit-berco-aviador-5pcs/1.png",
        "type": "pattern",
        "zone": "base",
        "description": "Camada base do kit"
      },
      {
        "index": 2,
        "file": "2.png",
        "url": "https://seu-projeto.supabase.co/storage/v1/object/public/bebelize-images/aviador/kit-berco-aviador-5pcs/2.png",
        "type": "pattern",
        "zone": "body",
        "description": "Corpo principal"
      },
      {
        "index": 3,
        "file": "3.png",
        "url": "https://seu-projeto.supabase.co/storage/v1/object/public/bebelize-images/aviador/kit-berco-aviador-5pcs/3.png",
        "type": "pattern",
        "zone": "detail",
        "description": "Detalhes decorativos"
      },
      {
        "index": 4,
        "file": "4.png",
        "url": "https://seu-projeto.supabase.co/storage/v1/object/public/bebelize-images/aviador/kit-berco-aviador-5pcs/4.png",
        "type": "pattern",
        "zone": "border",
        "description": "Bordas e acabamento"
      },
      {
        "index": 5,
        "file": "5.png",
        "url": "https://seu-projeto.supabase.co/storage/v1/object/public/bebelize-images/aviador/kit-berco-aviador-5pcs/5.png",
        "type": "pattern",
        "zone": "top",
        "description": "Camada superior"
      }
    ]
  }'
);