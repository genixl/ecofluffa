-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text NOT NULL DEFAULT ''::text,
  phone text NOT NULL DEFAULT ''::text,
  role text NOT NULL DEFAULT 'customer'::text CHECK (role = ANY (ARRAY['customer'::text, 'provider'::text, 'admin'::text])),
  provider_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  preferred_pickup_notes text NOT NULL DEFAULT ''::text,
  alternate_phone text NOT NULL DEFAULT ''::text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.providers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  location text NOT NULL DEFAULT ''::text,
  pickup_fee text NOT NULL DEFAULT 'Free pickup'::text,
  rating numeric NOT NULL DEFAULT 4.5,
  review_count integer NOT NULL DEFAULT 0,
  phone text NOT NULL DEFAULT ''::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_listed boolean NOT NULL DEFAULT false,
  approval_status text NOT NULL DEFAULT 'pending'::text CHECK (approval_status = ANY (ARRAY['pending'::text, 'approved'::text, 'disabled'::text])),
  photo_url text,
  CONSTRAINT providers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.services (
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Everyday'::text,
  price_label text NOT NULL DEFAULT ''::text,
  description text NOT NULL DEFAULT ''::text,
  turnaround text NOT NULL DEFAULT ''::text,
  popular boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  provider_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  approval_status text NOT NULL DEFAULT 'approved'::text CHECK (approval_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  CONSTRAINT services_pkey PRIMARY KEY (id),
  CONSTRAINT services_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id)
);
CREATE TABLE public.provider_services (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  provider_id uuid NOT NULL,
  price text NOT NULL,
  unit text NOT NULL,
  turnaround text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  service_id uuid NOT NULL,
  CONSTRAINT provider_services_pkey PRIMARY KEY (id),
  CONSTRAINT provider_services_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id),
  CONSTRAINT provider_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.orders (
  id text NOT NULL,
  customer_id uuid NOT NULL,
  provider_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'washing'::text, 'ready'::text, 'delivered'::text, 'cancelled'::text])),
  pickup_date date NOT NULL,
  pickup_time time without time zone NOT NULL,
  pickup_address text NOT NULL,
  notes text NOT NULL DEFAULT ''::text,
  total_estimate text NOT NULL DEFAULT ''::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  customer_phone text NOT NULL DEFAULT ''::text,
  customer_name text NOT NULL DEFAULT ''::text,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.profiles(id),
  CONSTRAINT orders_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id)
);
CREATE TABLE public.order_services (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id text NOT NULL,
  title text NOT NULL,
  price text NOT NULL,
  description text NOT NULL DEFAULT ''::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT order_services_pkey PRIMARY KEY (id),
  CONSTRAINT order_services_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.order_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id text NOT NULL,
  from_role text NOT NULL CHECK (from_role = ANY (ARRAY['customer'::text, 'provider'::text, 'admin'::text])),
  sender_name text NOT NULL,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT order_messages_pkey PRIMARY KEY (id),
  CONSTRAINT order_messages_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.order_activities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['status'::text, 'message'::text, 'booking'::text, 'admin'::text])),
  title text NOT NULL,
  detail text NOT NULL DEFAULT ''::text,
  actor_role text NOT NULL CHECK (actor_role = ANY (ARRAY['customer'::text, 'provider'::text, 'admin'::text])),
  actor_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT order_activities_pkey PRIMARY KEY (id),
  CONSTRAINT order_activities_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.contact_submissions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new'::text CHECK (status = ANY (ARRAY['new'::text, 'responded'::text, 'resolved'::text])),
  admin_response text,
  responded_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT contact_submissions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.customer_addresses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  label text NOT NULL DEFAULT ''::text,
  address text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT customer_addresses_pkey PRIMARY KEY (id),
  CONSTRAINT customer_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.ratings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id text NOT NULL UNIQUE,
  provider_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  comment text NOT NULL DEFAULT ''::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ratings_pkey PRIMARY KEY (id),
  CONSTRAINT ratings_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT ratings_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id),
  CONSTRAINT ratings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.profiles(id)
);