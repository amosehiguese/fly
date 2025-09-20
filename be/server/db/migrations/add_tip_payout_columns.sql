-- Add tip payout columns to checkout table
ALTER TABLE checkout
ADD COLUMN tip_payout_status ENUM('pending', 'paid') DEFAULT 'pending',
ADD COLUMN tip_payout_date DATETIME DEFAULT NULL;

-- Add index for faster tip payout queries
CREATE INDEX idx_tip_payout_status ON checkout(tip_payout_status); 