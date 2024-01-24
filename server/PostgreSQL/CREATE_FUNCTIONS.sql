CREATE OR REPLACE FUNCTION get_order_revenue()
  RETURNS TABLE (
    order_order_item_id INT,
    product_name VARCHAR(255),
    start_date DATE,
    end_date DATE,
    licensed_to VARCHAR(255),
    description VARCHAR(255),
    edition VARCHAR(255),
    cloud_site_hostname VARCHAR(255),
    support_entitlement_number VARCHAR(255),
    entitlement_number VARCHAR(255),
    cloud_id VARCHAR(255),
    cloud_site_url VARCHAR(255),
    sale_type VARCHAR(255),
    unit_price NUMERIC,
    platform VARCHAR(255),
    tax_exempt BOOLEAN,
    license_type VARCHAR(255),
    unit_count INTEGER,
    is_trial_period BOOLEAN,
    is_unlimited_users BOOLEAN,
    maintenance_months VARCHAR(255),
    price_adjustment NUMERIC,
    upgrade_credit NUMERIC,
    partner_discount_total NUMERIC,
    loyalty_discount_total NUMERIC,
    total NUMERIC,
    revenue_id INT,
    revenue_date TIMESTAMP WITH TIME ZONE,
    num VARCHAR(255),
    cod_articolo VARCHAR(255),
    name VARCHAR(255),
    memo TEXT,
    sen_hen VARCHAR(255),
    debit VARCHAR(255),
    credit VARCHAR(255)
  )
AS $$
BEGIN
  RETURN QUERY
  SELECT
    oi.id AS order_order_item_id,
    oi.product_name,
    oi.start_date::DATE,
    oi.end_date::DATE,
    oi.licensed_to,
    oi.description,
    oi.edition,
    oi.cloud_site_hostname,
    oi.support_entitlement_number,
    oi.entitlement_number,
    oi.cloud_id,
    oi."cloudSite_url" AS cloud_site_url,
    oi.sale_type,
    oi.unit_price,
    oi.platform,
    oi.tax_exempt,
    oi.license_type,
    oi.unit_count,
    oi.is_trial_period,
    oi.is_unlimited_users,
    oi.maintenance_months,
    oi.price_adjustment,
    oi.upgrade_credit,
    oi.partner_discount_total,
    oi.loyalty_discount_total,
    oi.total,
    oi.revenue_id,
    r.date AS revenue_date,
    r.num::VARCHAR(255) AS num,
    r.cod_articolo::VARCHAR(255) AS cod_articolo,
    r.name,
    r.memo,
    r.sen_hen,
    r.debit::VARCHAR(255) AS debit,
    r.credit::VARCHAR(255) AS credit
  FROM
    order_order_items oi
  INNER JOIN
    revenues r ON oi.revenue_id = r.id;
END;
$$ LANGUAGE plpgsql;


-- To get the resulting table use

-- SELECT * FROM get_order_revenue();