-- Execute uma unica vez no SQL Editor do Supabase, apos conferir o projeto.
-- Amplia a categoria aceita sem apagar os anuncios existentes.
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_category_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_category_check CHECK (category IN ('carros','motos','caminhoes','pecas','eletronicos','imoveis','alugueis','casa','servicos','outros'));
