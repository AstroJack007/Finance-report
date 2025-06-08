import { Button, Html } from "@react-email/components";
import * as React from "react";
import {
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Section,
} from "@react-email/components";

export default function Email({
  username = "",
  type = "budget-alert",
  data = {
   
  }}
) {
  if (type === "monthly-report") {
  }
  if (type === "budget-alert") {
    return (
      <Html>
        <Head />
        <Preview>Budget Alert</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Budget Alert</Heading>
            <Text style={styles.text}>Hello {username}</Text>
            <Text style={styles.text}>
              You&rsquo;ve used {data?.percentageUsed.toFixed(1)}% of your
              monthly budget.
            </Text>
            <Section style={styles.section}>
              <div style={styles.stats}>
                <Text style={styles.text}>Budget Amount:</Text>
                <Text style={styles.heading}>${data?.budgetAmount}</Text>
              </div>
              <div>
                <Text style={styles.text}>Spent So Far:</Text>
                <Text style={styles.heading}>${data?.totalExpenses}</Text>
              </div>
              <div>
                <Text style={styles.text}>Remaining Budget:</Text>
                <Text style={styles.heading}>${data?.remainingBudget}</Text>
              </div>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }
}

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily: "-apple-system,sans-serif",
  },
  container: {
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    margin: "0 0 20px",
  },
  heading: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "10px",
  },
  text: {
    fontSize: "16px",
    color: "#4b5563",
    marginBottom: "10px",
  },
  stats: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "20px",
  },
};
